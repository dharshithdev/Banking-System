const service = require('../services/authService');
const { setAuthCookie, clearAuthCookie } = require('../middleware/auth');

module.exports = {
  async login(req, res, next) {
    try {
      const result = await service.login(req.body.email, req.body.password);
      setAuthCookie(res, result.token);
      res.json({ user: result.profile });
    } catch (error) { next(error); }
  },
  async logout(req, res, next) {
    try {
      if (req.user?.id) await service.logout(req.user.id);
      clearAuthCookie(res);
      res.json({ message: 'Signed out successfully' });
    } catch (error) { next(error); }
  },
  async me(req, res, next) {
    try { res.json({ user: await service.getProfile(req.user.id) }); } catch (error) { next(error); }
  }
};
