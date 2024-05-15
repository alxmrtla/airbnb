// utils/auth.js
const { User } = require('../db/models');
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { secret, expiresIn } = jwtConfig;

const setTokenCookie = (res, user) => {
  const token = jwt.sign(
    { data: user.id },
    secret,
    { expiresIn: parseInt(expiresIn) } // 604800 seconds = 1 week
  );

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie('token', token, {
    maxAge: expiresIn * 1000, // maxAge in milliseconds
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction && "Lax"
  });

  return token;
};

const restoreUser = (req, res, next) => {
  const { token } = req.cookies;
  console.log('Token:', token);
  if (!token) {
    return next();
  }

  return jwt.verify(token, secret, null, async (err, jwtPayload) => {
    if (err) {
      res.clearCookie('token');
      return next();
    }

    try {
      req.user = await User.findByPk(jwtPayload.data);
      console.log('User:', req.user);
    } catch (e) {
      res.clearCookie('token');
      return next();
    }

    if (!req.user) res.clearCookie('token');

    return next();
  });
};

const requireAuth = [
  restoreUser,
  function (req, res, next) {
    if (req.user) return next();

    res.status(401).json({ message: 'Authentication required' });
  },
];

module.exports = { setTokenCookie, restoreUser, requireAuth };
