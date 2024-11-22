const express = require("express");
const auth = require("../middlewares/auth");
const {
  addComment,
  deleteComment,
} = require("../controllers/comment-controller");
const router = express.Router();

router.post("comment/:id", auth, addComment);
router.delete("comment/:id", auth, deleteComment);
