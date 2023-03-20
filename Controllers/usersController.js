const Profile = require("../models/Profile");
const FollowedProfile = require("../models/FollowedProfile");

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
}

module.exports = new usersController();