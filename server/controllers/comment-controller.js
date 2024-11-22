const User = require("../models/user-model");
const Post = require("../models/post-model");
const Comment = require("../models/comment-model");
const { default: mongoose } = require("mongoose");

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Invalid id" });
    }
    if (!text) {
      return res.status(400).json({ message: "Invalid text" });
    }
    const postExists = await Post.findById(id);
    if (!postExists) {
      return res.status(400).json({ message: "Post not found" });
    }
    const comment = new Comment({
      text,
      admin: req.user._id,
      post: postExists._id,
    });
    const newComment = await comment.save();
    await Post.findByIdAndUpdate(
      id,
      {
        $push: { comments: newComment._id },
      },
      { new: true }
    );
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { replies: newComment._id },
      },
      { new: true }
    );
    res.status(201).json({ msg: "commented." });
  } catch (error) {
    console.error(error);
  }
};
exports.deleteComment = async (req, res) => {
  try {
    const { postId, id } = req.params;
    if (!postId || id) {
      return res.status(400).json({ message: "error delete comment" });
    }
    const postExists = await Post.findById(postId);
    if (!postExists) {
      res.status(400).json({
        message: "Post not found",
      });
    }
    const commentExists = await Comment.findById(id);
    if (!commentExists) {
      return res.status(400).json({ message: "Comment not found" });
    }
    const newId = new mongoose.Types.ObjectId(id);
    if (postExists.comments.includes(newId)) {
      const id1 = commentExists.admin._id.toString();
      const id2 = req.user._id.toString();
      if (id1 === id2) {
        return res.status(400).json({ msg: "not authorized to delete." });
      }
      await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { comments: id },
        },
        { new: true }
      );
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { replies: id },
        },
        { new: true }
      );
    }
    await Comment.findByIdAndDelete(id);
    return res.status(200).json({ msg: "comment deleted." });
  } catch (error) {
    console.error(error);
  }
};
