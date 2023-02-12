const express = require("express");
const router = express.Router();
require("../Db/mongoose");
const CheckAuth = require("../middleware/CheckAuth");
const PostModel = require("../models/post");
const UserModal = require("../models/user");

router.get("/user/:id", CheckAuth, (req, res) => {
  UserModal.findOne({ _id: req.params.id })
    .select("-password")
    .then((user) => {
      PostModel.find({ postedBy: req.params.id })
        .populate("postedBy", "_id name")
        .exec((err, post) => {
          if (err) {
            return res.status(422).json({ error: err });
          }
          return res.status(200).json({ user, post });
        });
    })
    .catch((err) => {
      return res.status(404).json({ error: "User not found" });
    });
});

router.put("/follow", CheckAuth, (req, res) => {
  UserModal.findByIdAndUpdate(
    req.body.followId,
    {
      $push: { followers: req.user._id },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      UserModal.findByIdAndUpdate(
        req.user._id,
        {
          $push: { following: req.body.followId },
        },
        {
          new: true,
        }
      )
        .select("-password")
        .then((result) => {
          return res.status(200).json(result);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    }
  );
});

router.put("/unfollow", CheckAuth, (req, res) => {
  UserModal.findByIdAndUpdate(
    req.body.unfollowId,
    {
      $pull: { followers: req.user._id },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      UserModal.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { following: req.body.unfollowId },
        },
        {
          new: true,
        }
      )
        .select("-password")
        .then((result) => {
          return res.status(200).json(result);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    }
  );
});

router.put("/updatePic", CheckAuth, (req, res) => {
  UserModal.findByIdAndUpdate(
    req.user.id,
    {
      $set: { profilePic: req.body.profilePic },
    },
    { new: true },
    (err, result) => {
      if (err) {
        return res.status(422).json({ err: "Pic did not get posted!!" });
      }

      return res.status(200).json(result);
    }
  );
});

module.exports = router;
