const express = require("express");
const router = express.Router();
const User = require("../../models/Users");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const validateRegisterInput = require("../../validators/register");
const validateLoginInput = require("../../validators/login");

// convert plain text to hash
const hashPassword = password => {
  let hashedPassword = "";
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        throw err;
      } else {
        hashedPassword = hash;
      }
    });
  });

  return hashedPassword;
};

// @route   GET api/users/test
// @desc    Test users route
// @access  public
router.get("/test", (req, res) => res.json({ msg: "Users work" }));

// @route   POST api/users/register
// @desc    Register a new user
// @access  public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "email already exists" });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        avatar
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            throw err;
          } else {
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json({ user }))
              .catch(err => res.json({ err }));
          }
        });
      });
    }
  });
});

// @route   POST api/users/login
// @desc    login with an existing user / Returning JWT token
// @access  public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    res.status(400).json(errors);
  }

  const { email, password } = req.body;

  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "user not found";
      return res.status(400).json(errors);
    } else {
      // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // Payload for jwt
          const payload = {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
          };
          jwt.sign(
            payload,
            keys.secret,
            { expiresIn: 3600 },
            // { algorithm: "RS256" },
            (err, token) => {
              res.json({
                success: true,
                token: `Bearer ${token}`
              });
            }
          );
        } else {
          errors.password = "Incorrect password";
          return res.status(400).json(errors);
        }
      });
    }
  });
});

// @route   GET api/users/current
// @desc    Get current user
// @access  private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
