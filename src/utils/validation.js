const userRepo = require('../data-access/repositories/userRepository');

const authenticateSession = async (req, res, next) => {
  try {
    
    if (!req.session.user) {
      return res.status(401).json({ message: 'Missing session: please log in' });
    }

    // Attach minimal user object from session
    req.user = { 
      id: req.session.user.id, 
      username: req.session.user.username, 
      is_admin: req.session.user.is_admin 
    };

    // Optionally refresh user from DB to get latest is_deleted / is_admin flags
    const user = await userRepo.findById(req.user.id);
    if (!user || user.is_deleted) {
      // Invalidate session if user is deleted
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.status(401).json({ message: 'Invalid user' });
    }
    req.user.is_admin = user.is_admin;

    return next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

const authorizeAdmin = (req, res, next) => {
  console.log("object")
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!req.user.is_admin) return res.status(403).json({ message: 'Forbidden: admin only' });
  return next();
};

module.exports = { authenticateSession, authorizeAdmin }; 