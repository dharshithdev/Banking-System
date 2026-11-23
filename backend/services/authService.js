const userRepository = require('../repositories/userRepository');
const { AppError } = require('../middleware/errorHandler');
const { signToken, verifyPassword } = require('../middleware/auth');

const authService = {
  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) throw new AppError('Invalid email or password', 401);
    return {
      token: signToken({ sub: String(user._id), email: user.email, role: user.role, tokenVersion: user.tokenVersion }),
      profile: { id: String(user._id), name: user.name, email: user.email, role: user.role }
    };
  },
  async logout(userId) {
    const user = await userRepository.incrementTokenVersion(userId);
    if (!user) throw new AppError('User not found', 404);
  },
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return { id: String(user._id), name: user.name, email: user.email, role: user.role };
  }
};

module.exports = authService;
