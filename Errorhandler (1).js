// middleware/errorHandler.js — Global Error Handler
const { NODE_ENV } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const response = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      ...(NODE_ENV === 'development' && { stack: err.stack }),
    },
    timestamp: new Date().toISOString(),
  };

  console.error(`[ERROR] ${status} — ${err.message}`);
  res.status(status).json(response);
};

module.exports = errorHandler;