const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { User } = require("../../db/models");
const { setTokenCookie } = require("../../utils/auth");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const validateSignup = [
  check("email")
    .exists({ checkFalsy: true })
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email.")
    .custom(async (value) => {
      const user = await User.findOne({ where: { email: value } });
      if (user) {
        throw new Error("User with that email already exists");
      }
    }),
  check("username")
    .exists({ checkFalsy: true })
    .withMessage("Username is required.")
    .isLength({ min: 4 })
    .withMessage("Username must be at least 4 characters.")
    .custom(async (value) => {
      const user = await User.findOne({ where: { username: value } });
      if (user) {
        throw new Error("User with that username already exists");
      }
    }),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters or more."),
  check("firstName")
    .exists({ checkFalsy: true })
    .withMessage("First Name is required."),
  check("lastName")
    .exists({ checkFalsy: true })
    .withMessage("Last Name is required."),
  handleValidationErrors,
];

// POST /api/users - Register a new user
router.post("/", validateSignup, async (req, res) => {
  const { email, password, username, firstName, lastName } = req.body;
  const hashedPassword = bcrypt.hashSync(password);

  const userExists = await User.findOne({
    where: {
      username: username,
    },
  });
  const emailExists = await User.findOne({
    where: {
      email: email,
    },
  });

  if (userExists || emailExists) {
    const err = new Error("User already exists");
    err.status = 500;
    err.errors = {};
    if (userExists)
      err.errors.username = "User with that username already exists";
    if (emailExists) err.errors.email = "User with that email already exists";
    throw err;
  }

  const user = await User.create({
    email,
    username,
    firstName,
    lastName,
    hashedPassword,
  });

  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  await setTokenCookie(res, safeUser);

  res.json({
    user: safeUser,
  });
});

module.exports = router;
