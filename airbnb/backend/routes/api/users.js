// backend/routes/api/users.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../../db/models');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateSignup = [
    check('email')
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a valid email.'),
    check('username')
      .exists({ checkFalsy: true })
      .isLength({ min: 4 })
      .withMessage('Please provide a username with at least 4 characters.'),
    check('password')
      .exists({ checkFalsy: true })
      .isLength({ min: 6 })
      .withMessage('Password must be 6 characters or more.'),
    check('firstName')
      .exists({ checkFalsy: true })
      .withMessage('Please provide a first name.'),
    check('lastName')
      .exists({ checkFalsy: true })
      .withMessage('Please provide a last name.'),
    handleValidationErrors,
  ];

// POST /api/users - Register a new user
router.post('/', validateSignup, async (req, res) => {
    const { username, email, password } = req.body;

    try {
      const hashedPassword = bcrypt.hashSync(password, 10); // 10 is the salt length
      const user = await User.create({
        username,
        email,
        hashedPassword
      });

      await setTokenCookie(res, user);

      return res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (err) {
      next(err);
    }
  });

module.exports = router;
