// utils/auth.js
const jwt = require('jsonwebtoken');

const setTokenCookie = (res, user) => {
    // Create the token
    const token = jwt.sign(
        { data: user.id },
        process.env.JWT_SECRET,
        { expiresIn: parseInt(process.env.JWT_EXPIRES_IN, 10) }
    );

    // Set the token in a cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseInt(process.env.JWT_EXPIRES_IN, 10) * 1000,
    });
};

const restoreUser = (req, res, next) => {

    next();
};

module.exports = { restoreUser, setTokenCookie };
