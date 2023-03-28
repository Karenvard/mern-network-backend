const path = require('path')
require("dotenv").config({path: path.resolve(__dirname, "..", ".env")})
const User = require("../models/User");
const Profile = require("../models/Profile")
const Role = require("../models/Role");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken")
const {validationResult} = require("express-validator");
const FollowedProfile = require("../models/FollowedProfile")

const generateAccessToken = (id, roles, login, name, remember) => {
    const payload = {
        id,
        roles,
        login,
    }
    if (remember) {
        return jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: '24h'})
    }
    return jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: '2h'})
}

class authController {
    async register(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.json({
                    resultCode: 1,
                    error: {
                        type: "register-validation-error",
                        body: errors.error,
                    }
                })
            }
            const {login, name, vorname, password} = req.body;
            const candidate = await User.findOne({login})
            if (candidate) {
                return res.json({
                    resultCode: 1,
                    error: {
                        type: "register-repeated-user-error",
                        body: `Пользователь с логином ${login} уже существует`
                    }
                })
            }
            const hashedPassword = bcryptjs.hashSync(password, 7)
            const userRole = await Role.findOne({value: "USER"})
            const user = new User({login, password: hashedPassword, roles: [userRole.value]})
            const FollowedUsers = new FollowedProfile({userId: user._id})
            const userProfile = new Profile({
                login,
                name,
                vorname,
                userId: user._id,
                aboutMe: '',
                status: '',
                photos: {
                    large: '',
                    small: ''
                }
            })
            await user.save()
            await userProfile.save()
            await FollowedUsers.save()
            return res.json({
                resultCode: 0,
                message: {
                    type: "register-user-success",
                    body: `Пользователь ${login} успешно зарегестрирован`
                }
            })
        } catch (e) {
            res.json({
                resultCode: 1,
                error: {
                    type: "register-catch-error",
                    body: e.message
                },
            })
        }
    }

    async login(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.json({
                    resultCode: 1,
                    error: {
                        type: "login-validation-error",
                        body: errors.error,
                    }
                })
            }
            const {login, password, rememberMe} = req.body;
            const user = await User.findOne({login})
            const validatedPassword = bcryptjs.compareSync(password, user.password)
            if (!validatedPassword || !user) {
                return res.json({
                    resultCode: 1,
                    error: {
                        type: "login-fields-error",
                        body: "Неправильный логин или пароль"
                    }
                })
            }
            const token = generateAccessToken(user._id, user.roles, user.login, rememberMe);
            return res.json({
                resultCode: 0,
                token,
            })
        } catch (e) {
            res.json({
                resultCode: 1,
                error: {
                    type: "login-catch-error",
                    body: e.message
                }
            })
        }
    }

    async profile(req, res) {
        try {
            const {decodedData} = req
            const authUserData = await Profile.findOne({userId: decodedData.id})
            if (!authUserData) {
                res.json({resultCode: 1});
            }
            res.json({
                resultCode: 0,
                profile: authUserData
            })
        } catch (e) {
            res.json({
                resultCode: 1,
                error: {
                    type: "profile-catch-error",
                    body: e.message
                }
            })
        }
    }

    async uploadAuthPhoto(req, res) {
        try {
            const {decodedData, fileName} = req
            const oldAuthProfile = await Profile.findOne({userId: decodedData.id})
            await Profile.updateOne({userId: decodedData.id}, {
                $set: {
                    photos: {
                        small: `${process.env.SERVER_HOST}/${fileName}`,
                        large: oldAuthProfile.photos.large
                    }
                }
            })
            const authProfile = await Profile.findOne({userId: decodedData.id})
            res.json({
                resultCode: 0,
                message: {
                    type: "photo-changed-success",
                    body: "Фото профиля успешно изменено"
                },
                profile: authProfile
            })
        } catch (e) {
            res.json({
                resultCode: 1,
                error: {
                    type: "photo-catch-error",
                    body: e.message
                }
            })
        }
    }

    async uploadHeaderPhoto(req, res) {
        try {
            const {decodedData, fileName} = req
            const oldAuthProfile = await Profile.findOne({userId: decodedData.id})
            await Profile.updateOne({userId: decodedData.id}, {
                $set: {
                    photos: {
                        small: oldAuthProfile.photos.small,
                        large: `${process.env.SERVER_HOST}/${fileName}`
                    }
                }
            })
            const authProfile = await Profile.findOne({userId: decodedData.id})
            res.json({
                resultCode: 0,
                message: {
                    type: "header-changed-success",
                    body: "Фото успешно изменено"
                },
                profile: authProfile
            })
        } catch (e) {
            res.json({
                resultCode: 1,
                error: {
                    type: "header-catch-error",
                    body: e.message
                }
            })
        }
    }

    async changeAboutMe(req, res) {
        try {
            const {decodedData, body} = req
            const authProfile = await Profile.findOne({userId: decodedData.id})
            authProfile.aboutMe = body.value
            res.json({
                resultCode: 0,
                profile: authProfile,
                message: {
                    type: "aboutMe-changed-success",
                    body: "Описание профиля успешно изменено"
                }
            })
            await authProfile.save()
        } catch (e) {
            res.json({
                resultCode: 1,
                error: {
                    type: "aboutMe-catch-error",
                    body: e.message
                }
            })
        }
    }

    async changeStatus(req, res) {
        try {
            const errors = validationResult(req)
            const {decodedData, body} = req
            const authProfile = await Profile.findOne({userId: decodedData.id})
            authProfile.status = body.value
            if (!errors.isEmpty()) {
                return res.json({
                    resultCode: 1,
                    error: {
                        type: "status-validation-error",
                        body: errors.error,
                    }
                })
            }
            res.json({
                resultCode: 0,
                profile: authProfile,
                message: {
                    type: "status-changed-success",
                    body: "Статус профиля успешно изменен"
                }
            })
            await authProfile.save()
        } catch (e) {
            console.log(e);
            res.json({
                resultCode: 1,
                error: {
                    type: "status-catch-error",
                    body: e.message,
                }
            })
        }
    }

    async addPost(req, res) {
        try {
            const {decodedData, fileName} = req
            const {Title, Description} = req.body
            const authProfile = await Profile.findOne({userId: decodedData.id})
            authProfile.posts.push({
                Title,
                Description,
                Photo: `${process.env.SERVER_HOST}/${fileName}`,
                Likes: 0,
                Comments: []
            })
            res.json({
                resultCode: 0,
                profile: authProfile,
                message: {
                    type: "post-created-success",
                    body: "Пост был добавлен"
                }
            })
            await authProfile.save();
        } catch (e) {
            res.json({
                resultCode: 1,
                error: {
                    type: "post-catch-error",
                    body: e.message
                }
            })
        }
    }

    async addComment(req, res) {
        try {
            const {decodedData} = req;
            const {Title, Body, userId} = req.body;
            const user = await Profile.findOne({userId})
            user.posts.Comments.push({
                ownerId: decodedData.id,
                ownerLogin: decodedData.login,
                Title,
                Body,
                Likes: 0,
            })
            res.json({
                resultCode: 0,
                profile: user,
                message: {
                    type: "comment-created-success",
                    body: "Комментарий добавлен"
                }
            })
            user.save()
        } catch (e) {
            res.json({
                resultCode: 1,
                error: {
                    type: "comment-catch-error",
                    body: e.message
                }
            })
        }
    }

    async likePost(req, res) {
        try {
            const {userId, postId} = req.body
            const user = await Profile.findOne({userId})
            for (let i = 0; i < user.posts.length; i++) {
                if (user.posts[i]._id === postId) {
                    user.posts[i].Likes = user.posts[i].Likes + 1
                }
            }
            res.json({
                resultCode: 0,
                profile: user,
            })
            await user.save()
        } catch (e) {
            res.json({
                resultCode: 1,
                error: {
                    type: "likePost-catch-error",
                    body: e.message
                }
            })
        }
    }

    async likeComment(req, res) {
        try {
            const {commentId, userId} = req.body
            const user = await Profile.findOne({userId})
            for (let i = 0; i < user.posts.length; i++) {
                for (let j = 0; j < user.posts[i].Comments.length; j++) {
                    if (user.posts[i].Comments[j]._id === commentId) {
                        user.posts[i].Comments[j].Likes = user.posts[i].Comments[j].Likes + 1
                    }
                }
            }
            res.json({
                resultCode: 0,
                profile: user,
            })
            await user.save()
        } catch (e) {
            res.json({
                resultCode: 1,
                error: {
                    type: "likeComment-catch-error",
                    body: e.message
                }
            })
        }
    }

    async disLikePost(req, res) {
        try {
            const {userId, postId} = req.body
            const user = await Profile.findOne({userId})
            for (let i = 0; i < user.posts.length; i++) {
                if (user.posts[i]._id === postId) {
                    user.posts[i].Likes = user.posts[i].Likes - 1
                }
            }
            res.json({
                resultCode: 0,
                profile: user,
            })
            await user.save()
        } catch (e) {
            res.json({
                resultCode: 1,
                error: {
                    type: "disLikePost-catch-error",
                    body: e.message
                }
            })
        }
    }

    async disLikeComment(req, res) {
        try {
            const {commentId, userId} = req.body
            const user = await Profile.findOne({userId})
            for (let i = 0; i < user.posts.length; i++) {
                for (let j = 0; j < user.posts[i].Comments.length; j++) {
                    if (user.posts[i].Comments[j]._id === commentId) {
                        user.posts[i].Comments[j].Likes = user.posts[i].Comments[j].Likes - 1
                    }
                }
            }
            res.json({
                resultCode: 0,
                profile: user,
            })
            await user.save()
        } catch (e) {
            res.json({
                type: "disLikeComment-catch-error",
                body: e.message
            })
        }
    }
}

module.exports = new authController();