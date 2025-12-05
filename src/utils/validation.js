const { verifyJwt } = require('./jwt');
const userRepo = require('../data-access/repositories/userRepository');

// authenticateJWT & authorizeAdmin
const authenticateJWT = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'Missing authorization header' });
    const token = auth.split(' ')[1];
    const payload = verifyJwt(token);
    // attach minimal user object
    req.user = { id: payload.id, username: payload.username, is_admin: payload.is_admin };
    // optionally refresh user from DB to get latest is_deleted / is_admin flags:
    const user = await userRepo.findById(req.user.id);
    if (!user || user.is_deleted) return res.status(401).json({ message: 'Invalid user' });
    req.user.is_admin = user.is_admin;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!req.user.is_admin) return res.status(403).json({ message: 'Forbidden: admin only' });
  return next();
};

module.exports = { authenticateJWT, authorizeAdmin };
