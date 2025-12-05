const registerUsecase = require('../usecase/auth/registerUsecase');
const loginUsecase = require('../usecase/auth/loginUsecase');
const logoutUsecase = require('../usecase/auth/logoutUseCase');

const register = async (req, res, next) => {
  try {
    const out = await registerUsecase(req.body);
    return res.status(201).json(out);
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    // console.log("Tset");
    const out = await loginUsecase({
      username: req.body.username,
      password: req.body.password,
      session: req.session  // Pass session in
    });
    return res.json(out); // Now wrapped automatically
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    // Ensure session exists
    if (!req.session.user) {
      return res.status(401).json({ message: 'No active session' });
    }

    const { id } = req.session.user;
    const result = await logoutUsecase({ id });

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return next(err);
      }

      // Clear cookie explicitly
      res.clearCookie('connect.sid');

      // Respond with success
      return res.json({ message: result.message });
    });
  } catch (err) { next(err); }
};

module.exports = { register, login, logout };

