// utils/auth.js
const jwt = require("jsonwebtoken");

const setTokenCookie = (res, user) => {
  // Create the token
  const token = jwt.sign({ data: user.id }, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN, 10),
  });

  // Set the token in a cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: parseInt(process.env.JWT_EXPIRES_IN, 10) * 1000,
  });
};


const restoreUser = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
      return next();
    }

    try {
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(id);
      if (user) {
        req.user = user;
        return next();
      }
    } catch (e) {
      return next();
    }

    return next();
  };

  const requireAuth = (req, res, next) => {

    if (!req.user) {

      return res.status(401).json({
        message: "Authentication required"
      });
    }

    next();
  };


module.exports = { restoreUser, setTokenCookie, requireAuth };
