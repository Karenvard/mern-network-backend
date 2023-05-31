const User = require("../models/User");
const Chat = require('../models/Chat');
const { HTTP_Error } = require("./errorController");
const ProfileDto = require("../dto/profile.dto")

class usersController {
  async getUsers(req, res) {
    try {
      let { pageSize, page } = req.query
      const users = await User.find();
      if (pageSize * page > users.length) {
        pageSize = users.length;
        page = 1;
        page = Math.ceil(users.length / pageSize);
      }
      const resUsers = [];
      for (let i = pageSize * page; i >= (pageSize * (page - 1)); i--) {
        if (users[i]) resUsers.push(ProfileDto(users[i]));
      }
      return res.status(200).json({
        users: resUsers,
        totalCount: users.length
      })
    } catch (e) {
      return new HTTP_Error(res, "getusers", "Server error. Please try to load users later.").InternalServerError();
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params
      const profile = await User.findOne({ _id: id });
      if (!profile) return new HTTP_Error(res, "getuserbyid", "Incorrect user id").BadReque()
      return res.status(200).json({
        profile: ProfileDto(profile),
      })
    } catch (e) {
      return new HTTP_Error(res, "getuserbyid", "Server error. Please try check profile later.").InternalServerError()
    }
  }

  async followUser(req, res) {
    try {
      const { params, decodedData } = req;
      const authUser = await User.findOne({ _id: decodedData.id });
      const followedUser = await User.findOne({ _id: params.id })
      if (!followedUser) return new HTTP_Error(res, "followuser", "Incorrect user id").BadReque()
      auth.followed.push(followedUser._id);
      await authUser.save();
      return res.status(200).json({});
    } catch (e) {
      return new HTTP_Error(res, "followuser", "Server error. Please try to follow user later.").InternalServerError()
    }
  }

  async unFollowUser(req, res) {
    try {
      const { params, decodedData } = req;
      const authUser = await User.findOne({ _id: decodedData.id });
      const unfollowedUser = await User.findOne({ _id: params.id });
      if (!unfollowedUser) return new HTTP_Error(res, "unfollowuser", "Incorrect user id");
      authUser.followed = authUser.followed.filter(id => id !== unfollowedUser._id);
      await authUser.save();
      return res.status(200).json({})
    } catch (e) {
      return new HTTP_Error(res, "unfollowuser", "Server error. Please try to unfollowe user later.").InternalServerError()
    }
  }

  async startChat(req, res) {
    try {
      const { decodedData } = req;
      const { id } = req.body;
      const chats = await Chat.find();
      for (const chat of chats) {
        if (chat.includes(decodedData.id) && chat.includes(id)) return new HTTP_Error(res, "startchat", "Chat with that user is already exits").BadReque();
      }
      const newChat = await Chat.create();
      newChat.persons.push({ userId: decodedData.id });
      newChat.persons.push({ userId: req.body.id });
      await newChat.save();
      res.status(200).json({});
    } catch (e) {
      return new HTTP_Error(res, "startchat", "Server error. Please try to start new chat later.").InternalServerError()
    }
  }

  async getChats(req, res) {
    try {
      const { decodedData } = req;
      const dbChats = await Chat.find();
      const chats = [];
      const convPartners = [];
      for (let i = 0; i <= dbChats.length - 1; i++) {
        if (dbChats[i].persons[0].userId === decodedData.id) {
          chats.push(dbChats[i]);
        } else if (dbChats[i].persons[1].userId === decodedData.id) {
          chats.push(dbChats[i]);
        }
      }
      for (const chat of chats) {
        for (const person of chat.persons) {
          if (person.userId !== decodedData.id) convPartners.push(person);
        }
      }
      return res.status(200).json({ chats, convPartners })

    } catch (e) {
      return new HTTP_Error(res, "getchats", "Server error. Please try to get all chats later.").InternalServerError()
    }
  }

  async sendMessage(req, res) {
    try {
      const { decodedData } = req;
      const { text, to } = req.body;
      const chats = await Chat.find();
      const currentChat = chats.find(chat => chat.persons.includes(decodedData.id) && chat.persons.includes(to));
      currentChat.messages.push({ SenderID: decodedData.id, text })
      await currentChat.save();
      return res.status(200).json({});
    } catch (e) {
      return new HTTP_Error(res, "sendmessage", "Server error. Please try to send message later.").InternalServerError()
    }
  }
}

module.exports = new usersController();
