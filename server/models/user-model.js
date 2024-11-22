const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    bio: { type: String },
    public_id: {
      type: String,
    },
    followers: [
      {
        types: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    threads: [
      {
        types: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    replies: [
      {
        types: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    repost: [
      {
        types: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
