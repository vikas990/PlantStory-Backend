const jwt = require("jsonwebtoken");
require("../Db/mongoose");
const UserModel = require("../models/user");

module.exports = (req, res, next) => {
  // checking if authorization is present
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "You must be logged in!!" });
  }

  // if authorization is present then removing the "Bearer " using replace method
  const token = authorization.replace("Bearer ", "");

  // verifying secret with the token
  jwt.verify(token, process.env.SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: "You must be logged in!!" });
    }

    const { _id } = payload;
    UserModel.findById(_id).then((user) => {
      req.user = user;
      next();
    });
  });
};
