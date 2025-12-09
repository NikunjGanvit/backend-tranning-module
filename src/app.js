// app.js — fixed: ensure session middleware is installed BEFORE routes
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { createClient } = require('redis');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./utils/httpErrors');
const minioClient = require('./utils/minioClient');
require('./utils/cron/deleteSoftDeletedUsers');

const app = express();

/* Optional: trust proxy if behind a load balancer (set TRUST_PROXY=1 in env) */
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

/* CORS */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

/* Test MinIO (keeps existing behavior) */
async function testMinIOConnection() {
  try {
    const buckets = await minioClient.listBuckets();
    console.log('✅ MinIO Connected! Buckets:', buckets.map((b) => b.name));

    const bucketName = 'items-pictures';
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ Created bucket: ${bucketName}`);
    } else {
      console.log(`✅ Bucket '${bucketName}' is ready.`);
    }
  } catch (err) {
    console.error('❌ MinIO connection failed:', err.message);
    process.exit(1);
  }
}
testMinIOConnection();


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get('/health', (req, res) => res.json({ ok: true }));

const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  'c8adf06dd8334879abcf601334e7d44fa3f83a5a499a93243d7c92f2183135cb';

const redisUrl = REDIS_PASSWORD
  ? `redis://:${encodeURIComponent(REDIS_PASSWORD)}@${REDIS_HOST}:${REDIS_PORT}`
  : `redis://${REDIS_HOST}:${REDIS_PORT}`;

const redisClient = createClient({ url: redisUrl });
redisClient.on('error', (err) => {
  console.error('❌ Redis Error:', err);
});

(async () => {
  let connectRedisModule;
  try {
    connectRedisModule = require('connect-redis');
  } catch (eRequire) {
    try {
      const imported = await import('connect-redis');
      connectRedisModule = imported.default || imported;
    } catch (eImport) {
      console.error('Failed to load connect-redis via require() and import():', eRequire, eImport);
      console.error('If needed, install the classic API: npm i connect-redis@6');
      process.exit(1);
    }
  }
  const resolveCandidate = (candidate) => {
    if (!candidate) return null;
    if (typeof candidate === 'function') {

      try {
        const maybeCtor = candidate(session); 
        if (typeof maybeCtor === 'function') return maybeCtor;
      } catch (e) {
        return candidate;
      }
      return candidate;
    }
    if (typeof candidate === 'object') {
      if (candidate.RedisStore && typeof candidate.RedisStore === 'function') {
        return candidate.RedisStore; 
      }
      if (candidate.default) return resolveCandidate(candidate.default);
    }
    return null;
  };

  const StoreConstructor = resolveCandidate(connectRedisModule);

  if (!StoreConstructor) {
    console.error('connect-redis import shape not recognized. Module keys:', Object.keys(connectRedisModule || {}));
    console.error('Module sample:', connectRedisModule);
    console.error('Quick fix: install connect-redis@6 (classic API) or ensure connect-redis is installed.');
    process.exit(1);
  }

  try {
    await redisClient.connect();
    console.log('✅ Connected to Redis at', redisUrl);
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    process.exit(1);
  }


  let store;
  try {
    store = new StoreConstructor({ client: redisClient, prefix: 'sess:' });
  } catch (errNew) {
    // fallback: some shapes expect a different invocation; try calling as a function
    try {
      store = StoreConstructor({ client: redisClient, prefix: 'sess:' });
    } catch (err2) {
      console.error('Failed to instantiate session store:', errNew, err2);
      process.exit(1);
    }
  }

  app.use(
    session({
      store,
      name: process.env.SESSION_COOKIE_NAME || 'sid',
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.SESSION_SAMESITE || 'strict',
        maxAge: Number(process.env.SESSION_MAX_AGE_MS) || 1000 * 60 * 60 * 24, // 1 day
      },
    })
  );

  if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
      console.log('Session ID:', req.sessionID);
      next();
    });
  }

  app.use(routes);
  app.use(errorHandler);
})();

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down...`);
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      console.log('Redis disconnected');
    }
  } catch (err) {
    console.warn('Error disconnecting Redis:', err);
  }
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;
