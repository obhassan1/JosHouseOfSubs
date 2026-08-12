const jwt = require('jsonwebtoken');

function requireAuthentication(
  request,
  response,
  next
) {
  const authorization =
    request.get('authorization') || '';

  const [scheme, token] =
    authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    response.status(401).json({
      message: 'Staff sign-in required.'
    });
    return;
  }

  if (!process.env.JWT_SECRET) {
    response.status(503).json({
      message:
        'Staff access is not configured.'
    });
    return;
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        algorithms: ['HS256'],
        issuer: 'jos-house-of-subs-api',
        audience: 'jos-house-of-subs-staff'
      }
    );

    if (
      !['staff', 'super_admin'].includes(
        payload.role
      )
    ) {
      response.status(403).json({
        message:
          'This account does not have staff access.'
      });
      return;
    }

    request.user = payload;
    next();
  } catch (_error) {
    response.status(401).json({
      message:
        'Your staff session has expired.'
    });
  }
}

function requireSuperAdmin(
  request,
  response,
  next
) {
  if (
    request.user?.role !== 'super_admin'
  ) {
    response.status(403).json({
      message:
        'Super-administrator access is required.'
    });
    return;
  }

  next();
}

module.exports = {
  requireAuthentication,
  requireSuperAdmin,
  requireAdmin: requireAuthentication
};