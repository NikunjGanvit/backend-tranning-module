const express = require('express');
const routes = require('./routes');
const errorHandler = require('./utils/httpErrors');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// health
app.get('/health', (req, res) => res.json({ ok: true }));

// main api routes
app.use(routes);

// global error handler (centralized)
app.use(errorHandler);

module.exports = app;
