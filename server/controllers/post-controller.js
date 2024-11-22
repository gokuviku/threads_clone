const User = require("../models/user-model");
const Post = require("../models/post-model");
const Comment = require("../models/comment-model");
const cloudinary = require("../config/cloudinary");
const formidable = require("formidable");
const mongoose = require("mongoose");
exports.addPost = async (req, res) => {
  const form = formidable({});
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ message: "Error parsing form" });
    }

    let post = new Post();

    if (fields.text) {
      post.text = fields.text;
    }

    if (files.media) {
      try {
        const uploadedImage = await cloudinary.uploader.upload(
          files.media.filepath,
          { folder: "Threads_clone/Profiles/Posts" }
        );
        if (!uploadedImage) {
          return res.status(400).json({ message: "Error uploading image" });
        }
        post.media = uploadedImage.secure_url;
        post.public_id = uploadedImage.public_id;
      } catch (uploadError) {
        return res
          .status(400)
          .json({ message: "Error uploading image", error: uploadError });
      }
    }

    post.admin = req.user._id;

    try {
      const newPost = await post.save();
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { threads: newPost._id },
        },
        { new: true }
      );

      return res.json({ message: "Post created successfully", post: newPost });
    } catch (saveError) {
      return res
        .status(400)
        .json({ message: "Error creating post", error: saveError });
    }
  });
};

exports.allPost = async (req, res) => {
  try {
    const { page } = req.query;
    let pageNumber = page;
    if (!page || page === undefined) {
      pageNumber = 1;
    }
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * 3)
      .limit(3)
      .populate({ path: "admin", select: "-paassword" })
      .populate({ path: "likes", select: "-paassword" })
      .populate({
        path: "comments",
        populate: { path: "admin", model: "User" },
      });
    return res.status(200).json({ msg: "posts fetched.", posts });
  } catch (error) {
    return res.status(500).json({ msg: "Error fetching posts.", error });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ msg: "Post id is required." });
    }
    const postExists = await Post.findById(id);
    if (!postExists) {
      return res.status(404).json({ msg: "Post not found." });
    }
    const userId = req.user._id.toString();
    const adminId = postExists.admin._id.toString();
    if (userId !== adminId) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to delete this post" });
    }
    if (postExists.media) {
      await cloudinary.uploader.destroy(
        postExists.public_id,
        (error, result) => {
          console.log({ error, result });
        }
      );
    }
    await Comment.deleteMany({ _id: { $in: postExists.comments } });
    await User.updateMany(
      {
        $or: [{ threads: id }, { reposts: id }, { replies: id }],
      },
      {
        $pull: { threads: id, reposts: id, replies: id },
      },
      { new: true }
    );
    await Post.findByIdAndDelete(id);
    res.status(400).json({ msg: "Post deleted." });
  } catch (error) {
    return res.status(500).json({ msg: "Error delete posts.", error });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ msg: "Post id is required." });
    }
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found." });
    }
    if (post.likes.includes(req.user._id)) {
      await Post.findByIdAndUpdate(
        id,
        { $pull: { likes: req.user._id } },
        { new: true }
      );
      return res.status(201).json({ msg: "Post unliked.!" });
    }
    await Post.findByIdAndUpdate(
      id,
      { $push: { likes: req.user._id } },
      { new: true }
    );
    return res.status(201).json({ msg: "Post liked.!" });
  } catch (error) {
    return res.status(400).json({ msg: "error in liking." });
  }
};

exports.reposts = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ msg: "id is needed." });
    }
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ msg: "post not found." });
    }
    const newId = new mongoose.Types.ObjectId(id);
    if (req.user.reposts.includes(newId)) {
      return res.status(400).json({ msg: "You already reposted this post." });
    }
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { reposts: post._id },
      },
      { new: true }
    );
    res.status(201).json({ msg: "reposted successfully." });
  } catch (error) {
    res.status(400).json({ msg: "cann not repost" });
  }
};

exports.singlePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ msg: "id is needed." });
    }
    const post = await Post.findById(id)
      .populate({ path: "admin", select: "-password" })
      .populate({ path: "likes", select: "-password" })
      .populate({ path: "comments", populate: { path: "admin" } });
    res.status(200).json({ msg: "post fetched." });
  } catch (error) {
    return res.status(400).json({ msg: "error in getting post" });
  }
};
