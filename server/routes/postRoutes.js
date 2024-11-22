const express = require("express");
const auth = require("../middlewares/auth");
const {
  addPost,
  allPost,
  deletePost,
  likePost,
  reposts,
  singlePost,
} = require("../controllers/post-controller");
const router = express.Router();

router.post("/post", auth, addPost);
router.get("/post", auth, allPost);
router.get("/post/:id", auth, deletePost);
router.put("/post/like/:id", auth, likePost);
router.put("/repost/:id", auth, reposts);
router.get("/post/:id", auth, singlePost);

module.exports = router;
