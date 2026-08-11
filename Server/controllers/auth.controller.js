const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const LOGIN_DELAY_MS = 400;

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

exports.login = async (request, response, next) => {
  try {
    const configuredUsername = process.env.ADMIN_USERNAME;
    const configuredPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const jwtSecret = process.env.JWT_SECRET;

    if (!configuredUsername || !configuredPasswordHash || !jwtSecret) {
      response.status(503).json({
        message: 'Administrator access has not been configured on the server.'
      });
      return;
    }

    const username = String(request.body.username || '').trim();
    const password = String(request.body.password || '');
    const usernameMatches = username.toLowerCase() === configuredUsername.trim().toLowerCase();
    const passwordMatches = password
      ? await bcrypt.compare(password, configuredPasswordHash)
      : false;

    if (!usernameMatches || !passwordMatches) {
      await delay(LOGIN_DELAY_MS);
      response.status(401).json({ message: 'Invalid username or password.' });
      return;
    }

    const token = jwt.sign(
      { sub: configuredUsername, role: 'admin' },
      jwtSecret,
      {
        algorithm: 'HS256',
        expiresIn: '8h',
        issuer: 'jos-house-of-subs-api',
        audience: 'jos-house-of-subs-admin'
      }
    );

    response.json({ token, expiresInSeconds: 8 * 60 * 60 });
  } catch (error) {
    next(error);
  }
};