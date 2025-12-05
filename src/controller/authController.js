const registerUsecase = require('../usecase/auth/registerUsecase');
const loginUsecase = require('../usecase/auth/loginUsecase');

const register = async (req, res, next) => {
  try {
    const out = await registerUsecase(req.body);
    return res.status(201).json(out);
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const out = await loginUsecase(req.body);
    return res.json(out);
  } catch (err) { next(err); }
};

module.exports = { register, login };
