const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const formidable = require("formidable");
const cloudinary = require("../config/cloudinary");

exports.signin = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res
        .status(400)
        .json({ message: "User already exist.please login" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!hashedPassword) {
      return res.status(400).json({ message: "Password hashing failed" });
    }
    const user = new User({
      userName,
      email,
      password: hashedPassword,
    });
    const result = await user.save();
    if (!result) {
      return res.status(400).json({ message: "User saving failed" });
    }
    const accessToken = jwt.sign(
      { token: result._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    if (!accessToken) {
      return res
        .status(400)
        .json({ message: "Access token generation failed" });
    }
    res.cookie("token", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.status(201).json({
      message: `User signedIn successfully! hello ${result?.userName}`,
    });
    //  res.status(200).json(req.body);
  } catch (err) {
    res.status(400).json({ msg: "error signin", err: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res
        .status(400)
        .json({ message: "User not found.please signin first..." });
    }
    const passwordMatch = await bcrypt.compare(password, userExists.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const accessToken = jwt.sign(
      {
        token: userExists._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    if (!accessToken) {
      return res.status(400).json({ msg: "token not genrated in login." });
    }
    res.cookie("token", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({ msg: "user logged in successfully." });
  } catch (error) {
    res.status(400).json({ msg: "error signin", err: err.message });
  }
};

exports.userDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ msg: "id is required." });
    }
    const user = await User.findById(id)
      .select("-password")
      .populate("followers")
      .populate({
        path: "threads",
        populate: [{ path: "likes" }, { path: "ccomments" }, { path: "admin" }],
      })
      .populate({ path: "replies", populate: { path: "admin" } })
      .populate({
        path: "reposts",
        populate: [{ path: "likes" }, { path: "comments" }, { path: "admin" }],
      });

    res.status(200).json({ msg: "user detaiales fetched. !", user });
  } catch (error) {
    res.status(400).json({ msg: "error signin", err: err.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ msg: "id is required." });
    }
    const userExists = await User.findById(id);
    if (!userExists) {
      return res.status(400).json({ msg: "user not found." });
    }
    if (userExists.followers.includes(req.user._id)) {
      await User.findByIdAndUpdate(
        userExists._id,
        {
          $pull: { followers: req.user._id },
        },
        { new: true }
      );
      return res.status(201).json({ msg: `unfollowed ${userExists.userName}` });
    }
    await User.findByIdAndUpdate(
      userExists._id,
      {
        $push: { followers: req.user._id },
      },
      { new: true }
    );
    return res.status(201).json({ msg: `following ${userExists.userName}` });
  } catch (error) {
    res.status(400).json({ msg: "error signin", err: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userExists = await User.findById(req.user._id);
    if (!userExists) {
      return res.status(400).json({ msg: "user not found." });
    }
    const form = formidable({});
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ msg: "error signin", err: err.message });
      }
      if (fields.text) {
        await User.findByIdAndUpdate(
          req.user._id,
          { bio: fields.text },
          { new: true }
        );
      }
      if (files.media) {
        if (userExists.public_id) {
          await cloudinary.uploader.destroy(
            userExists.public_id,
            (error, result) => {
              console.log({ error, result });
            }
          );
        }
        const uploadedImage = await cloudinary.uploader.upload(
          files.media.filepath,
          {
            folder: "Threads_clone/Profiles",
          }
        );
        if (!uploadedImage) {
          return res
            .status(400)
            .json({ msg: "error uploading pic.", err: err.message });
        }
        await User.findByIdAndUpdate(
          req.user._id,
          {
            profilePic: uploadedImage.secure_url,
            public_id: uploadedImage.public_id,
          },
          { new: true }
        );
      }
    });
    res.status(201).json({ msg: "updated profile." });
  } catch (error) {
    res.status(400).json({ msg: "error signin", err: err.message });
  }
};
