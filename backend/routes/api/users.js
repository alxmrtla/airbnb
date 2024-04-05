// backend/routes/api/users.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { User } = require("../../db/models");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const validateSignup = [
  check("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Please provide a valid email.")
    .custom((value) => {
      return User.findOne({ where: { email: value } }).then((user) => {
        if (user) {
          return Promise.reject("User with that email already exists");
        }
      });
    }),
  check("username")
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage("Please provide a username with at least 4 characters.")
    .custom((value) => {
      return User.findOne({ where: { username: value } }).then((user) => {
        if (user) {
          return Promise.reject("User with that username already exists");
        }
      });
    }),
  check("password")
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters or more."),
  check("firstName")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a first name."),
  check("lastName")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a last name."),
  handleValidationErrors,
];

// POST /api/users - Register a new user
router.post("/", validateSignup, async (req, res) => {
  const { email, password, username, firstName, lastName } = req.body;

  try {
    const hashedPassword = bcrypt.hashSync(password, 10); // 10 is the salt length
    const user = await User.create({
      email,
      username,
      hashedPassword,
      firstName,
      lastName,
    });
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    await setTokenCookie(res, user);

    return res.json(safeUser);
  } catch (err) {
    if (
      err.name === "SequelizeValidationError" ||
      err.name === "SequelizeUniqueConstraintError"
    ) {
      const errors = {};
      err.errors.forEach((error) => {
        errors[error.path] = error.message;
      });

      return res.status(400).json({
        message: "Validation error",
        errors,
      });
    } else {
      next(err);
    }
  }
});

module.exports = router;
