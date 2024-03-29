// backend/routes/api/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../../db/models');
const { setTokenCookie } = require('../../utils/auth');

// POST /api/users - Register a new user
router.post('/', async (req, res, next) => {
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
