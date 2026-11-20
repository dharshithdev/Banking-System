const { AppError } = require('./errorHandler');
function rateLimit({ windowMs = 60000, max = 120 } = {}) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const times = (hits.get(key) || []).filter((time) => now - time < windowMs);
    const resetSeconds = Math.ceil(windowMs / 1000);
    res.set({ 'RateLimit-Limit': String(max), 'RateLimit-Remaining': String(Math.max(0, max - times.length - 1)), 'RateLimit-Reset': String(resetSeconds) });
    if (times.length >= max) return next(new AppError('Too many requests. Try again later.', 429));
    times.push(now);
    hits.set(key, times);
    if (hits.size > 10000) for (const [ip, values] of hits) if (!values.some((v) => now - v < windowMs)) hits.delete(ip);
    next();
  };
}
module.exports = rateLimit;
