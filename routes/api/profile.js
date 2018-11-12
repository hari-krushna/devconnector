const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const validateProfileInput = require("../../validators/profile");

// Load Profile && User models
const Profile = require("../../models/Profile");
const User = require("../../models/Users");

// @route   GET api/profile/test
// @desc    Test profile route
// @access  public
router.get("/test", (req, res) => res.json({ msg: "Profile route works" }));

// @route GET api/profile
// @desc Get current users profile
// @access private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "No profile exists for this user";
          return res.status(404).json(errors);
        }
        return res.json(profile);
      })
      .catch(error => res.json(error));
  }
);

// @route GET api/profile/all
// @desc get all profiles
// @access public
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
  .populate('user', ["name", "avatar"])
  .then(profiles => {
    if (!profiles) {
      errors.noprofile = "There are no profiles";
      res.status(404).json(errors);
    }
    res.json(profiles)
  })
  .catch(error => res.status(404).json({ profile: "There are no profiles"}))
})

// @route GET api/profile/handle/:handle
// @desc get profile by handle
// @access public
router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "No profile exists for the handle";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(error => res.json({ profile: "There is no profile for this user"}));
});

// @route GET api/profile/user/:user_id
// @desc get profile by user ID
// @access public
router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
  .populate('user', ["name", "avatar"])
  .then(profile => {
    if (!profile) {
      errors.noprofile = "There is no profile for this user"
      res.status(404).json(errors)
    }
    res.json(profile)
  })
  .catch(error => res.json({ profile: "There is no profile for this user"}));
});

// @route POST api/profile
// @desc create or update user profile
// @access private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Validate fields
    if (!isValid) {
      return res.status(400).json(errors);
    }

    // Get Fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    if (typeof req.body.skills !== "undefined")
      profileFields.skills = req.body.skills.split(",");

    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create

        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }
          // Create Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

module.exports = router;
