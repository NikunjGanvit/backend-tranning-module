const jwt = require('jsonwebtoken');
const config = require('../config');

const signJwt = (payload, expiresIn = config.jwtExpiresIn) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
};

const verifyJwt = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

module.exports = { signJwt, verifyJwt };
