const express = require("express");
const router = express.Router();
require("../Db/mongoose");
const CheckAuth = require("../middleware/CheckAuth");
const PostModel = require("../models/post");

router.post("/createPost", CheckAuth, (req, res) => {
  const { title, body, pic } = req.body;

  if (!title || !body || !pic) {
    return res.status(422).json({ error: "All field are required!!" });
  }

  const post = new PostModel({
    title,
    body,
    photo: pic,
    postedBy: req.user._id,
  });

  post
    .save()
    .then((result) => {
      res.send({ post: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/allPost", (req, res) => {
  PostModel.find()
    .populate("postedBy", "_id name profilePic")
    .populate("comments.postedBy", "_id name profilePic")
    .then((posts) => {
      res.status(200).json({ posts });
    })
    .catch((err) => console.log(err));
});

router.get("/myPost", CheckAuth, (req, res) => {
  PostModel.find({ postedBy: req.user })
    .populate("postedBy", "_id name profilePic")
    .populate("comments.postedBy", "_id name profilePic")
    .then((myPosts) => {
      res.status(200).json({ myPosts });
    })
    .catch((err) => console.log(err));
});

router.put("/like", CheckAuth, (req, res) => {
  const { postId, userId } = req.body;

  PostModel.findById(postId)
    .populate("postedBy", "_id name profilePic")
    .populate("comments.postedBy", "_id name profilePic")
    .then((post) => {
      if (!post.likes.includes(userId)) {
        PostModel.findByIdAndUpdate(
          postId,
          {
            $push: { likes: req.user._id },
          },
          { new: true }
        ).exec((err, result) => {
          if (err) {
            return res.status(422).json({ error: err });
          } else {
            PostModel.find()
              .populate("postedBy", "_id name profilePic")
              .populate("comments.postedBy", "_id name profilePic")
              .then((posts) => {
                res.status(200).json({ posts });
              })
              .catch((err) => console.log(err));
          }
        });
      } else {
        PostModel.findByIdAndUpdate(
          postId,
          {
            $pull: { likes: req.user._id },
          },
          { new: true }
        ).exec((err, result) => {
          if (err) {
            return res.status(422).json({ error: err });
          } else {
            PostModel.find()
              .populate("postedBy", "_id name profilePic")
              .populate("comments.postedBy", "_id name profilePic")
              .then((posts) => {
                res.status(200).json({ posts });
              })
              .catch((err) => console.log(err));
          }
        });
      }
    })
    .catch((err) => console.log(err));
});

router.put("/comment", CheckAuth, (req, res) => {
  const { postId, comment } = req.body;
  const comments = {
    comment: comment,
    postedBy: req.user._id,
  };
  PostModel.findByIdAndUpdate(
    postId,
    {
      $push: { comments },
    },
    { new: true }
  )
    .populate("postedBy", "_id name profilePic")
    .populate("comments.postedBy", "_id name profilePic")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        PostModel.find()
          .populate("postedBy", "_id name profilePic")
          .populate("comments.postedBy", "_id name profilePic")
          .then((posts) => {
            res.status(200).json({ posts });
          })
          .catch((err) => console.log(err));
      }
    });
});

router.delete("/deletePost/:postId", CheckAuth, (req, res) => {
  const { postId } = req.params;
  PostModel.findOne({ _id: postId })
    .populate("postedBy", "_id")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      if (result.postedBy._id.toString() === req.user._id.toString()) {
        result
          .remove()
          .then((data) => {
            res.json({ result, message: "Post delete successfully!!" });
          })
          .catch((err) => console.log(err));
      }
    });
});

router.put("/deleteComment", CheckAuth, (req, res) => {
  const { postId, commentId } = req.body;
  const comments = {
    _id: commentId,
  };
  PostModel.findByIdAndUpdate(
    postId,
    {
      $pull: { comments },
    },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      PostModel.find()
        .populate("postedBy", "_id name profilePic")
        .populate("comments.postedBy", "_id name profilePic")
        .then((posts) => {
          res.status(200).json({ posts });
        })
        .catch((err) => console.log(err));
    }
  });
});

router.get("/fetchFollowersAllPost", CheckAuth, (req, res) => {
  PostModel.find({ postedBy: { $in: req.user.following } })
    .populate("postedBy", "_id name profilePic")
    .populate("comments.postedBy", "_id name profilePic")
    .then((posts) => {
      res.status(200).json({ posts });
    })
    .catch((err) => console.log(err));
});

router.put("/updatePost", CheckAuth, (req, res) => {
  const { title, body, pic } = req.body;

  if (!title || !body || !pic) {
    return res.status(422).json({ error: "All field are required!!" });
  }

  PostModel.findByIdAndUpdate(
    { _id: req.body.id },
    {
      $set: { title: title, body: body, photo: pic, postedBy: req.user._id },
    },
    { new: true },
    (err, result) => {
      if (err) {
        return res.status(422).json({ err: "Post did not get posted!!", err });
      }

      return res.status(200).json(result);
    }
  );
});
module.exports = router;
