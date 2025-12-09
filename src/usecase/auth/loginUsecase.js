const userRepo = require('../../data-access/repositories/userRepository');
const { comparePassword } = require('../../utils/password');

const loginUsecase = async ({ username, password, session }) => {
  const user = await userRepo.findByUsername(username);  // Plain object
  if (!user || user.is_deleted) {  // Works on plain bool
    throw { status: 401, message: 'Invalid credentials' };
  }

  const ok = await comparePassword(password, user.password);  // Plain string
  if (!ok) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  // Set session (same as before)
  session.user = { 
    id: user.id, 
    username: user.username, 
    is_admin: user.is_admin 
  };
  console.log('LOGIN: Session set with user ID:', user.id);

  // Regenerate session ID for security
  session.regenerate((err) => {
    if (err) throw { status: 500, message: 'Session error' };

    // Re-attach to new session
    session.user = { 
      id: user.id, 
      username: user.username, 
      is_admin: user.is_admin 
    };

    // Force save
    session.save((saveErr) => {
      if (saveErr) throw { status: 500, message: 'Session save error' };
      console.log('LOGIN: Session saved with new ID:', session.id);
    });
  });

  return { 
    message: 'Logged in successfully', 
    user: { id: user.id, username: user.username } 
  };
};

module.exports = loginUsecase;