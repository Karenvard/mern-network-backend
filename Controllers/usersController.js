const User = require("../models/User");
const Chat = require('../models/Chat');
const {HTTP_Error} = require("./errorController");

class usersController {
    async getUsers(req, res) {
        try {
            let {pageSize, page} = req.query
            const users = await User.find();
            if (pageSize*page > user.length) {
                pageSize = 30;
                page = Math.ceil(user.length/pageSize);
            }
            const resUsers = [];
            for (let i = pageSize*page; i >= (pageSize*(page - 1)); i--) {
                if (users[i]) resUsers.push(users[i]);
            }
            return res.status(200).json({
                users,
                totalCount: users.length
            })
        } catch (e) {
            return new HTTP_Error(res, "getusers", "Server error. Please try to load users later.").InternalServerError();
        }
    }

    async getUserById(req, res) {
        try {
            const {id} = req.params
            const profile = await User.findOne({_id: id});
            if (!profile) return new HTTP_Error(res, "getuserbyid", "Incorrect user id").BadRequest()
            return res.status(200).json({
                profile,
            })
        } catch (e) {
            return new HTTP_Error(res, "getuserbyid", "Server error. Please try check profile later.").InternalServerError()
        }
    }

    async followUser(req, res) {
        try {
            const {params, decodedData} = req;
            const authUser = await User.findOne({_id: decodedData.id});
            const followedUser = await User.findOne({_id: params.id})
            if (!followedUser) return new HTTP_Error(res, "followuser", "Incorrect user id").BadRequest()
            auth.followed.push(followedUser._id);
            await authUser.save();
            return res.status(200).json({message: "User is followed successfully"});
        } catch (e) {
            return new HTTP_Error(res, "followuser", "Server error. Please try to follow user later.").InternalServerError()
        }
    }

    async unFollowUser(req, res) {
        try {
            const {params, decodedData} = req;
            const authUser = await User.findOne({_id: decodedData.id});
            const unfollowedUser = await User.findOne({_id: params.id});
            if (!unfollowedUser) return new HTTP_Error(res, "unfollowuser", "Incorrect user id");
            authUser.followed = authUser.followed.filter(id => id !== unfollowedUser._id);
            await authUser.save();
            return res.status(200).json({message: "User is unfollowed successfully"})
        } catch (e) {
            return new HTTP_Error(res, "unfollowuser", "Server error. Please try to unfollowe user later.").InternalServerError()
        }
    }

    async getFollowedUsers(req, res) {
        try {
          const {decodedData} = req;
          const authUser = await User.findOne({_id: decodedData.id});
          const followedUsers = authUser.followed;
          return res.status(200).json({
              followedUsers,
          })
        } catch (e) {
          return new HTTP_Error(res, "getfollowedusers", "Server error. Please try to load users later.").InternalServerError()
        }
    }

    async startChat(req, res) {
        try {
            const {decodedData} = req;
            const {id} = req.body;
            const chats = await Chat.find();
            for (const chat of chats) {
                if (chat.includes(decodedData.id) && chat.includes(id)) return new HTTP_Error(res, "startchat", "Chat with that user is already exits").BadRequest();
            }
            const newChat = new Chat();
            newChat.persons.push({userId: decodedData.id});
            newChat.persons.push({userId: req.body.id});
            await newChat.save();
            res.status(200).json({
                message: "The chat started successfully"
            })
        } catch (e) {
            return new HTTP_Error(res, "startchat", "Server error. Please try to start new chat later.").InternalServerError()
        }
    }

    async getChats(req, res) {
        try {
            const {decodedData} = req;
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
            for (let i = 0; i < chats.length; i++) {
                if (chats[i].persons[0].userId !== decodedData.id) {
                    convPartners.push(await Profile.findOne({userId: chats[i].persons[0].userId}))
                } else if (chats[i].persons[1].userId !== decodedData.id) {
                    convPartners.push(await Profile.findOne({userId: chats[i].persons[1].userId}))
                }
            }
            return res.status(200).json({chats, convPartners})

        } catch (e) {
            return new HTTP_Error(res, "getchats", "Server error. Please try to get all chats later.").InternalServerError()
        }
    }

    async sendMessage(req, res) {
        try {
          const {decodedData} = req;
          const {chat, text} = req.body;
          const currentChat = await Chat.findOne({_id: chat._id})
          currentChat.messages.push({SenderID: decodedData.id, text})
          await currentChat.save();
          return res.status(200).json({
              message: "Message was sended successfully"
          })
        } catch (e) {
          return new HTTP_Error(res, "sendmessage", "Server error. Please try to send message later.").InternalServerError()
        }
    }
}

module.exports = new usersController();
