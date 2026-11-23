const service = require('../services/authService');
const { setAuthCookie, clearAuthCookie } = require('../middleware/auth');

module.exports = {
  async login(req, res, next) {
    try {
      const result = await service.login(req.body.email, req.body.password);
      if (result.token) {
        setAuthCookie(res, result.token);
        return res.json({ user: result.profile });
      }
      res.json(result);
    } catch (error) { next(error); }
  },
  async verifyOtp(req, res, next) {
    try {
      const result = await service.verifyLoginOtp(req.body.email, req.body.otp);
      setAuthCookie(res, result.token);
      res.json({ user: result.profile });
    } catch (error) { next(error); }
  },
  async resendOtp(req, res, next) {
    try { res.json(await service.resendLoginOtp(req.body.email)); }
    catch (error) { next(error); }
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
