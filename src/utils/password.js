const bcrypt = require('bcrypt');
const config = require('../config');

const hashPassword = async (plain) => {
  const rounds = config.bcryptSaltRounds || 12;
  return bcrypt.hash(plain, rounds);
};

const comparePassword = async (plain, hash) => {
  return bcrypt.compare(plain, hash);
};

module.exports = { hashPassword, comparePassword };
