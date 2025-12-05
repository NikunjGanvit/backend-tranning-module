const express = require('express');
const routes = require('./routes');
const errorHandler = require('./utils/httpErrors');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

// Security: CORS if needed for frontend (add if cross-origin)
const cors = require('cors'); // npm install cors if missing
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Adjust
  credentials: true, // Allow session cookies
}));

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? 'c8adf06dd8334879abcf601334e7d44fa3f83a5a499a93243d7c92f2183135cb', 
    resave: false, 
    saveUninitialized: false, 
    cookie: {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', // Enforce HTTPS in prod
      sameSite: 'strict', // Good for CSRF; use 'lax' if forms need redirects
      maxAge: 1000 * 60 * 60 * 24, // 1 day—consider shorter for sensitive apps
    },
    // Prod tip: Add store for multi-server (e.g., Redis)
    // store: new (require('connect-redis')(session))({ client: redisClient }),
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health (unchanged—great for monitoring)
app.get('/health', (req, res) => res.json({ ok: true }));

// Optional: Session debug middleware (remove in prod)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID); // For testing
    next();
  });
}

// Main API routes
app.use(routes);

// Global error handler (unchanged—handles 401/500 from auth nicely)
app.use(errorHandler);

module.exports = app;