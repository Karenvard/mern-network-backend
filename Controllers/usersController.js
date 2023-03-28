const Profile = require("../models/Profile");
const FollowedProfile = require("../models/FollowedProfile");
const Chat = require('../models/Chat')
const ChalkStyles = require("../ChalkStyles");
const { db } = require("../models/Profile");

class usersController {
    async getUsers(req, res) {
        try {
            const {decodedData} = req
            let {pageSize, page} = req.query
            const usersProfiles = await Profile.find();
            if (pageSize > 100) {
                if (100 > usersProfiles.length) {
                    pageSize = usersProfiles.length
                } else if (100 < usersProfiles.length) {
                    pageSize = 100
                }
            } else if (pageSize <= 100) {
                if (pageSize > usersProfiles.length) {
                    pageSize = usersProfiles.length
                }
            }
            if (page > usersProfiles.length - pageSize) {
                page = 1
            }
            const followedProfiles = await FollowedProfile.findOne({userId: decodedData.id})
            let users = [];
            let lastUser = pageSize * page
            for (let i = lastUser - pageSize; i < lastUser; i++) {
                let followedStatus = false;
                for (let j = 0; j < followedProfiles.users.length; j++) {
                    if (usersProfiles[i].userId === followedProfiles.users[j].id) {
                        followedStatus = true
                    }
                }
                usersProfiles[i].followed = followedStatus
                users.push(usersProfiles[i])
            }
            res.json({
                resultCode: 0,
                users,
                totalCount: usersProfiles.length
            })
        } catch (e) {
            console.log(e);
            res.json({
                resultCode: 1,
                error: {
                    type: "getUsers-catch-error",
                    body: e.message
                }
            })
        }
    }

    async getUserById(req, res) {
        try {
            const {id} = req.params
            const profile = await Profile.findOne({userId: id})
            res.json({
                resultCode: 0,
                profile,
            })
        } catch (e) {
            res.json({
                resultCode: 1,
                error: {
                    type: "getUser-catch-error",
                    body: e.message
                }
            })
        }
    }

    async followUser(req, res) {
        try {
            const {params, decodedData} = req
            const followedProfile = await FollowedProfile.findOne({userId: decodedData.id})
            followedProfile.users.push({id: params.id})
            followedProfile.save()
            res.json({resultCode: 0})
        } catch (e) {
            return res.json({
                resultCode: 1,
                error: {
                    type: "follow-catch-error",
                    body: e.message
                }
            })
        }
    }

    async unFollowUser(req, res) {
        try {
            const {params, decodedData} = req
            let followedProfile = await FollowedProfile.findOne({userId: decodedData.id})
            followedProfile.users = followedProfile.users.filter(u => {
                return u.id !== params.id;
            })
            followedProfile.save()
            res.json({resultCode: 0})
        } catch (e) {
            return res.json({
                resultCode: 1,
                error: {
                    type: "unfollow-catch-error",
                    body: e.message
                }
            })
        }
    }

    async getFollowedUsers(req, res) {
        const {decodedData} = req;
        const followedProfile = await FollowedProfile.findOne({userId: decodedData.id});
        const followedUsers = [];
        for (let i = 0; i <= followedProfile.users.length - 1; i++) {
            const followedUser = await Profile.findOne({userId: followedUsers.users[i]})
            followedUsers.push(followedUser);
        }
        return res.json({
            resultCode: 0,
            followedUsers,
        })
    }

    async startChat(req, res) {
        try {
            const {decodedData} = req;
            const newChat = new Chat();
            newChat.persons.push({userId: decodedData.id});
            newChat.persons.push({userId: req.body.id});
            await newChat.save();
            ChalkStyles.successfulMSG("Chat started")
            res.json({
                resultCode: 0,
            })
        } catch (e) {
            res.json({
                resultCode: 1,
                error: "startChat-catch-error",
                message: e
            })
        }
    }

    async getChats(req, res) {
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
        res.json({chats, convPartners})
    }

    async sendMessage(req, res) {
        const {decodedData} = req;
        const {chat, text} = req.body;
        const currentChat = await Chat.findOne({_id: chat._id})
        currentChat.messages.push({SenderID: decodedData.id, text})
        await currentChat.save();
        res.json({
            resultCode: 0
        })
    }
}

module.exports = new usersController();