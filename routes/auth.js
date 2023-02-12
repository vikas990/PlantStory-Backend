const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("../Db/mongoose");
const UserModel = require("../models/user");
const CheckAuth = require("../middleware/CheckAuth");

router.post("/signup", (req, res) => {
  // Getting data from the Body
  const { name, email, password, profilePic } = req.body;

  // Check if all the field are filled or not.
  if (!name || !email || !password) {
    return res.status(422).send({ error: "All fields are required!!" });
  }

  // Check if the user already exist
  UserModel.findOne({ email: email })
    .then((user) => {
      if (user) {
        return res
          .status(422)
          .send({ error: "User already exist with this email!!" });
      }

      // if User does not exist create new user
      // Hashing the password before creating new user
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
          const User = new UserModel({
            name,
            email,
            password: hash,
            profilePic,
          });

          User.save()
            .then(() => res.status(201).send({ message: "User created!!" }))
            .catch((err) => console.log(err));
        });
      });
    })
    .catch((err) => console.log(err));
});

router.post("/signin", (req, res) => {
  // fetching details from body
  const { email, password } = req.body;

  // check if all field are filled
  if (!email || !password) {
    return res.status(422).json({ error: "All field is required!!" });
  }

  //Signing up in user
  UserModel.findOne({ email: email })
    .then((user) => {
      // checking if user is exits
      if (!user) {
        return res.status(422).json({ error: "Invalid credentials" });
      }
      // comparing password
      bcrypt
        .compare(password, user.password)
        .then((matched) => {
          if (matched) {
            const token = jwt.sign({ _id: user._id }, process.env.SECRET);
            const { _id, name, email, followers, following, profilePic } = user;
            res.status(200).json({
              token,
              user: { _id, name, email, followers, following, profilePic },
            });
          } else {
            return res.status(422).json({ error: "Invalid credentials" });
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

module.exports = router;
