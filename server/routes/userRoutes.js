const express = require("express");
const router = express.Router();
const {
  signin,
  login,
  searchUser,
  logout,
  myInfo,
} = require("../controllers/user-controller");
const auth = require("../middlewares/auth");
const {
  userDetails,
  followUser,
  updateProfile,
} = require("../controllers/user-controller");

router.post("/login", login);
router.post("/signin", signin);
router.post("/logout", auth, logout);

router.get("/user/:id", auth, userDetails);
router.put("/user/follow/:id", auth, followUser);
router.put("/update", auth, updateProfile);
router.get("/user/search/:query", searchUser);
router.get("/me", myInfo);

module.exports = router;
