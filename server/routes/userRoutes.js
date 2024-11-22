const express = require("express");
const router = express.Router();
const { signin, login } = require("../controllers/user-controller");
const auth = require("../middlewares/auth");
const {
  userDetails,
  followUser,
  updateProfile,
} = require("../controllers/user-controller");

router.post("/login", login);
router.post("/signin", signin);

router.get("/user/:id", auth, userDetails);
router.put("/user/follow/:id", auth, followUser);
router.put("/update", auth, updateProfile);

module.exports = router;
