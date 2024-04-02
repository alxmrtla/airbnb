// utils/auth.js
const jwt = require('jsonwebtoken');

const setTokenCookie = (res, user) => {
    // Create the token
    const token = jwt.sign(
        { data: user.id },
        process.env.JWT_SECRET,
        { expiresIn: parseInt(process.env.JWT_EXPIRES_IN, 10) } // Expires in, e.g., 1 week
    );

    // Set the token in a cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: parseInt(process.env.JWT_EXPIRES_IN, 10) * 1000, // Max age in milliseconds
    });
};
// Inside utils/auth.js
const restoreUser = (req, res, next) => {
    // Your implementation here
    next();
};

module.exports = { restoreUser, setTokenCookie };
