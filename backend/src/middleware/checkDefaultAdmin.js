const DEFAULT_ADMIN_EMAIL = 'admin@gmail.com';

function checkDefaultAdmin(req, res, next) {
  try {
    const email = String(req.user?.email || '').toLowerCase();
    if (email !== DEFAULT_ADMIN_EMAIL) {
      return res.status(403).json({ message: 'Access denied' });
    }
    return next();
  } catch {
    return res.status(403).json({ message: 'Access denied' });
  }
}

module.exports = { checkDefaultAdmin };

