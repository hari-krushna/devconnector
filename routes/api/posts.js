const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Post model
const Post = require("../../models/Post");
// Profile model
const Profile = require("../../models/Profile");

// Post valiadator
const validatePostInput = require("../../validators/post");

// @route   GET api/posts/test
// @desc    Test posts route
// @access  public
router.get("/test", (req, res) => res.json({ msg: "Posts work" }));

// @route GET api/posts
// @desc get all posts
// @access public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(error => res.status(404).json({ nopostsfound: "No posts found" }));
});

// @route GET api/posts/:id
// @desc get post by id
// @access public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.json(post);
      } else {
        res.status(404).json({ nopostfound: "No post found for this id" });
      }
    })
    .catch(error =>
      res.status(404).json({ nopostfound: "No post found for this id" })
    );
});

// @route POST api/posts
// @desc create post
// @access private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // validate
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// @route DELETE api/posts/:id
// @desc delete post by id
// @access private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(
        Post.findById(req.params.id).then(post => {
          //check the post owner
          if (post.user.toString() !== req.user.id) {
            res.status(401).json({ notauthorized: "Not authorized to delete" });
          }
          post.remove().then(() => res.json({ success: true }));
        })
      )
      .catch(error => res.status(404).json({ postnotfound: "No post found" }));
  }
);

// @route POST api/posts/like/:postid
// @desc like post
// @access private
router.post(
  "/like/:postid",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.postid)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length > 0
            ) {
              return res
                .status(400)
                .json({ alreadyliked: "User already liked this post" });
            }

            // Add user id to user array
            post.likes.unshift({ user: req.user.id });
            post.save().then(post => res.json(post));
          })
          .catch(err =>
            res.status(404).json({ postnotfound: "No post found" })
          );
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

// @route POST api/posts/unlike/:postid
// @desc unlike post
// @access private
router.post(
  "/unlike/:postid",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.postid)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length === 0
            ) {
              return res
                .status(400)
                .json({ notliked: "You have not liked this post" });
            }

            // Get index of the element to be removed
            const removeIndex = post.likes
              .map(item => item.id)
              .indexOf(req.user.id);

            // if (removeIndex === -1) {
            //   return res
            //     .status(404)
            //     .json({ error: "There is no post with this ID" });
            // } else {


              // Splice out of array
              post.likes.splice(removeIndex, 1);
              post.save().then(post => res.json(post));

              
            // }
          })
          .catch(err =>
            res.status(404).json({ postnotfound: "No post found" })
          );
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

module.exports = router;
