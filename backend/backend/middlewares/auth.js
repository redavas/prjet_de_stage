// Simple authentication middleware (for demonstration)
module.exports = (req, res, next) => {
  // In a real app, use JWT or session authentication
  const token = req.headers['authorization'];
  if (!token || token !== 'Bearer mysecrettoken') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}; 