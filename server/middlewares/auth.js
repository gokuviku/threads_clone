const User = require("../models/user-model");
const jwt = require("jsonwebtoken");
const auth = async (req, res, next) => {
  try {
    const token = req.cokkies.token;
    if (!token) {
      return res.status(400).json({ msg: "No token in auth!" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(400).json({ msg: "error decoding token." });
    }
    const user = await User.findById(decodedToken)
      .populate("followers")
      .populate("threads")
      .populate("replies")
      .populate("reposts");

    if (!user) {
      return res.status(400).json({ msg: "no user found." });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ msg: "Error in auth", error: error.message });
  }
};

module.exports = auth;
