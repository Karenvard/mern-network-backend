require("dotenv").config();
const path = require("path");
const User = require("../models/User");
const Role = require("../models/Role");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator");
const { HTTP_Error } = require("./errorController");
const ProfileDto = require("../dto/profile.dto");
const fs = require("node:fs");

const generateAccessToken = (id, roles, username, remember) => {
  const payload = {
    id,
    roles,
    username,
  }
  if (remember) {
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '24h' })
  }
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '2h' })
}

class authController {
  async signup(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const error = errors.array()[0];
        return new HTTP_Error(res, "signup", error.msg).BadRequest()
      }
      const { username, name, surname, password } = req.body;
      const candidate = await User.findOne({ username })
      if (candidate) {
        return new HTTP_Error(res, "signup", `User with username ${login} is already exists.`).BadRequest()
      }
      const hashedPassword = bcryptjs.hashSync(password, 7)
      const userRole = await Role.findOne({ NAME: "USER" })
      const user = new User({
        username,
        name,
        surname,
        password: hashedPassword,
        status: "",
        aboutMe: "",
        avatar: "",
        header: "",
        followed: [],
        roles: [userRole],
        posts: [],
      })
      await user.save()
      return res.status(200).json({
        message: `User ${username} was signed up successfully`
      })
    } catch (e) {
      return new HTTP_Error(res, "signup", "Server error. Please try sign up later").InternalServerError()
    }
  }

  async signin(req, res) {
    try {
      const { username, password, rememberMe } = req.body;
      const user = await User.findOne({ username })
      const validatedPassword = bcryptjs.compareSync(password, user.password || "")
      if (!validatedPassword || !user) return new HTTP_Error(res, "signin", "Incorrect username or password.").BadRequest();
      const token = generateAccessToken(user._id, user.roles, user.username, rememberMe);
      return res.status(200).json({
        token,
        message: `You signed in successfully.`
      })
    } catch (e) {
      return new HTTP_Error(res, "signin", "Server error. Please try sign in later.").InternalServerError()
    }
  }

  async profile(req, res) {
    try {
      const { decodedData } = req
      const authUserData = await User.findOne({ _id: decodedData.id })
      if (!authUserData) return new HTTP_Error(res, "profile", `Server error. No user ${decodedData.username}`).BadRequest()
      return res.status(200).json({
        profile: ProfileDto(authUserData)
      })
    } catch (e) {
      return new HTTP_Error(res, "Server error. Please try again later.").InternalServerError()
    }
  }
  
  async posts(req, res) {
    try {
      const { page, pagiSize} = req.query;
      const { decodedData } = req;
      const { posts } = await Profile.findOne({_id: decodedData});
      
    } catch(e) {
      return new HTTP_Error(res, "posts", "Server error. Please try to get posts later.").InternalServerError()
    }
  }

  async uploadAvatar(req, res) {
    try {
      const { decodedData, fileName } = req;
      const user = await User.findOne({ _id: decodedData.id });
      if (user.avatar) {
        const splittedLink = user.avatar.split("/");
        const PhotoName = splittedLink[splittedLink.length - 1];
        fs.unlink(path.resolve(__dirname, "..", "..", "static", PhotoName), function(err) {
          if (err) throw new Error();
        });
      }
      await User.updateOne({ _id: decodedData.id }, {
        $set: {
          avatar: `${process.env.SERVER_HOST}/${fileName}`,
        }
      });
      res.status(200).json({
        message: "Photo uploaded successfully"
      })
    } catch (e) {
      return new HTTP_Error(res, "avatar", "Server error. Please try upload photo later.").InternalServerError()
    }
  }

  async uploadHeader(req, res) {
    try {
      const { decodedData, fileName } = req;
      const user = await User.findOne({ _id: decodedData.id });
      if (user.header) {
        const splittedLink = user.header.split("/");
        const PhotoName = splittedLink[splittedLink.length - 1];
        fs.unlink(path.resolve(__dirname, "..", "..", "static", PhotoName), function(err) {
          if (err) throw new Error("");
        });
      }
      await User.updateOne({ _id: decodedData.id }, {
        $set: {
          header: `${process.env.SERVER_HOST}/${fileName}`
        }
      })
      res.status(200).json({
        message: "Photo uploaded successfully"
      })
    } catch (e) {
      console.log(e);
      return new HTTP_Error(res, "header", "Server error. Please try upload photo later.").InternalServerError()
    }
  }

  async clearAvatar(req, res) {
    try {
      const {decodedData} = req;
      const user = await User.findOne({_id: decodedData.id});
      const splittedOldPhotoUrl = user.avatar.split("/");
      const oldPhotoName = splittedOldPhotoUrl[splittedOldPhotoUrl.length - 1];
      fs.unlink(path.resolve(__dirname, "..", "..", "static", oldPhotoName), function (err) {
        if (err) throw new Error("");
      });
      await User.updateOne({_id: decodedData.id}, {$set: {avatar: ""}})
      return res.status(200).json({});
    } catch(_) {
      return new HTTP_Error(res, "clearavatar", "Server error. Please try delete profile photo later.").InternalServerError();
    }
  }

  async clearHeader(req, res) {
    try {
      const {decodedData} = req;
      const user = await User.findOne({_id: decodedData.id});
      const splittedOldPhotoUrl = user.header.split("/");
      const oldPhotoName = splittedOldPhotoUrl[splittedOldPhotoUrl.length - 1];
      fs.unlink(path.resolve(__dirname, "..", "..", "static", oldPhotoName), function (err) {
        if (err) throw new Error("");
      });
      await User.updateOne({_id: decodedData.id}, {$set: {header: ""}});
      return res.status(200).json({});
    } catch(_) {
      return new HTTP_Error(res, "clearheader", "Server error. Please try delete profile header photo later.").InternalServerError();
    }
  }

  async changeAboutMe(req, res) {
    try {
      const { decodedData } = req;
      const { aboutMe } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error = errors.array()[0];
        return new HTTP_Error(res, "aboutme", error.msg).BadRequest()
      }
      await User.updateOne({ _id: decodedData.id }, {
        $set: {
          aboutMe
        }
      })
      res.status(200).json({
        message: "Profile description was changed successfully"
      })
    } catch (e) {
      return new HTTP_Error(res, "aboutme", "Server error. Please try change profile description later.").InternalServerError()
    }
  }

  async changeStatus(req, res) {
    try {
      const errors = validationResult(req)
      const { decodedData } = req;
      const { status } = req.body;
      await User.updateOne({ _id: decodedData.id }, {
        $set: {
          status: status,
        }
      })
      if (!errors.isEmpty()) {
        const error = errors.array()[0];
        return new HTTP_Error(res, "status", error.msg).BadRequest()
      }
      res.status(200).json({
        message: "Profile status was changed successfully"
      })
    } catch (e) {
      return new HTTP_Error(res, "status", "Server error. Please try change your profile status later.").InternalServerError()
    }
  }

  async addPost(req, res) {
    try {
      const { decodedData, fileName } = req
      const { title, body } = req.body
      const authProfile = await User.findOne({ _id: decodedData.id })
      authProfile.posts.push({
        title,
        body,
        photo: `${process.env.SERVER_HOST}/${fileName}`,
        likes: [],
        comments: []
      })
      res.status(200).json({
        message: "Post was added successfully"
      })
      await authProfile.save();
    } catch (e) {
      return new HTTP_Error(res, "addpost", "Server error. Please try add new post later.").InternalServerError()
    }
  }

  async addComment(req, res) {
    try {
      const { decodedData } = req;
      const { title, body, userId, postId } = req.body;
      const user = await User.findOne({ _id: userId })
      user.posts = user.posts.map(async function(post) {
        if (post._id === postId) {
          post.comments.push({
            owner: await User.findOne({ _id: decodedData.id }),
            title,
            body,
            likes: 0,
          })
        }
        return post;
      })
      user.save();
      res.status(200).json({
        message: "Comment was added successfully"
      })
      user.save()
    } catch (e) {
      return new HTTP_Error(res, "addcomment", "Server error. Please try to add comment later.").InternalServerError()
    }
  }

  async likePost(req, res) {
    try {
      const { decodedData } = req;
      const { userId, postId } = req.body
      const user = await User.findOne({ _id: userId });
      user.posts = user.posts.map(function(post) {
        if (post._id === postId && !post.likes.includes(decodedData.id)) {
          post.likes.push(decodedData.id);
        }
        return post;
      })
      await user.save();
      return res.status(200).json({
        message: "Post was liked successfully"
      })
    } catch (e) {
      return new HTTP_Error(res, "likepost", "Server error. Please try to like post later.").InternalServerError()
    }
  }

  async likeComment(req, res) {
    try {
      const { commentId, postId, userId } = req.body;
      const { decodedData } = req;
      const user = await User.findOne({ _id: userId });
      user.posts = user.posts.map(function(post) {
        post.comments = post.comments.map(function(comment) {
          if (post._id === postId && comment._id === commentId && !comment.likes.includes(decodedData.id)) {
            comment.likes.push(decodedData.id);
          }
          return comment;
        })
        return post;
      })
      await user.save();
      return res.status(200).json({
        message: "Comment was liked successfully"
      })
    } catch (e) {
      return new HTTP_Error(res, "likecomment", "Server error. Please try to like comment later.").InternalServerError()
    }
  }

  async disLikePost(req, res) {
    try {
      const { userId, postId } = req.body;
      const { decodedData } = req;
      const user = await User.findOne({ _id: userId });
      user.posts = user.posts.map(function(post) {
        if (post._id === postId) {
          post.likes = post.likes.filter(id => id !== decodedData.id);
        }
        return post;
      })
      await user.save()
      return res.status(200).json({
        message: "Post was disliked successfully",
      })
    } catch (e) {
      return new HTTP_Error(res, "dislikepost", "Server error. Please try to dislike post later.").InternalServerError()
    }
  }

  async disLikeComment(req, res) {
    try {
      const { commentId, postId, userId } = req.body
      const { decodedData } = req;
      const user = await User.findOne({ _id: userId })
      user.posts = user.posts.map(function(post) {
        post.comments = post.comments.map(function(comment) {
          if (post._id === postId && comment._id === commentId) {
            comment.likes = comment.likes.filter(id => id !== decodedData.id);
          }
          return comment;
        })
        return post;
      })
      await user.save()
      res.status(200).json({
        message: "Comment was disliked successfully"
      })
    } catch (e) {
      return new HTTP_Error(res, "dislikecomment", "Server error. Please try to dislike comment later.").InternalServerError()
    }
  }
}

module.exports = new authController();
