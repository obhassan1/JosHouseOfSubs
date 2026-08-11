const jwt = require('jsonwebtoken');

function requireAdmin(request, response, next) {
  const authorization = request.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    response.status(401).json({ message: 'Administrator sign-in required.' });
    return;
  }

  if (!process.env.JWT_SECRET) {
    response.status(503).json({ message: 'Administrator access is not configured.' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'jos-house-of-subs-api',
      audience: 'jos-house-of-subs-admin'
    });

    request.admin = payload;
    next();
  } catch (_error) {
    response.status(401).json({ message: 'Your administrator session has expired.' });
  }
}

module.exports = { requireAdmin };