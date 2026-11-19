class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large' });
  if (err instanceof SyntaxError && err.status === 400) return res.status(400).json({ error: 'Invalid request body' });
  let status = err.statusCode || err.status;
  if (!status) {
    if (err.code === 11000) status = 409;
    else if (err.name === 'ValidationError' || err.name === 'CastError') status = 422;
    else if (/not found/i.test(err.message)) status = 404;
    else if (/cannot be deleted|only pending/i.test(err.message)) status = 409;
    else if (/invalid|must|positive|required|insufficient|active|tenure|principal|interest/i.test(err.message)) status = 400;
    else status = 500;
  }
  const message = status >= 500 && process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message;
  if (status >= 500 && process.env.NODE_ENV !== 'production') console.error(err);
  res.status(status).json({ error: message || 'Internal Server Error' });
}

module.exports = errorHandler;
module.exports.AppError = AppError;
