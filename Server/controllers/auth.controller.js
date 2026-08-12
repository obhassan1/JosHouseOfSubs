const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const LOGIN_DELAY_MS = 400;

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

exports.login = async (request, response, next) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    const accounts = [
      {
        username: process.env.ADMIN_USERNAME,
        passwordHash:
          process.env.ADMIN_PASSWORD_HASH,
        role: 'super_admin'
      },
      {
        username: process.env.STAFF_USERNAME,
        passwordHash:
          process.env.STAFF_PASSWORD_HASH,
        role: 'staff'
      }
    ].filter(
      (account) =>
        account.username &&
        account.passwordHash
    );

    if (accounts.length === 0 || !jwtSecret) {
      response.status(503).json({
        message:
          'Staff access has not been configured on the server.'
      });
      return;
    }

    const username = String(
      request.body.username || ''
    ).trim();

    const password = String(
      request.body.password || ''
    );

    const account = accounts.find(
      (candidate) =>
        username.toLowerCase() ===
        candidate.username.trim().toLowerCase()
    );

    const passwordMatches =
      account && password
        ? await bcrypt.compare(
            password,
            account.passwordHash
          )
        : false;

    if (!account || !passwordMatches) {
      await delay(LOGIN_DELAY_MS);

      response.status(401).json({
        message:
          'Invalid username or password.'
      });
      return;
    }

    const token = jwt.sign(
      {
        sub: account.username,
        role: account.role
      },
      jwtSecret,
      {
        algorithm: 'HS256',
        expiresIn: '8h',
        issuer: 'jos-house-of-subs-api',
        audience: 'jos-house-of-subs-staff'
      }
    );

    response.json({
      token,
      role: account.role,
      username: account.username,
      expiresInSeconds: 8 * 60 * 60
    });
  } catch (error) {
    next(error);
  }
};