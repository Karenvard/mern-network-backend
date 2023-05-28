const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware")
const authController = require("../Controllers/authController")
const {check} = require("express-validator")
const fileUpload = require('express-fileupload')
const imageMiddleware = require('../middleware/imageMiddleware')

router.post("/signup", [
    check('username', "Логин пользователя не может быть пустым").notEmpty(),
    check('password', 'Пароль пользователя не может быть пустым').notEmpty(),
    check('name', 'Имя пользователя не может быть пустым').notEmpty(),
    check('surname', 'Фамилия пользователя не может быть пустым').notEmpty(),
    check('username', "Логин не должен быть меньше 3-ех символов и не больше 10-ти").isLength({min: 1, max: 10}),
    check('password', "Пароль не должен быть меньше 8-ех символов и не больше 18-ти").isLength({min: 8, max: 18}),
    check('name', "Имя не должно быть меньше 3-ех символов и не больше 15-ти").isLength({min: 1, max: 15}),
    check('surname', "Фамилия не должна быть меньше 5-ех символов и не больше 18-ти").isLength({min: 3, max: 18}),
], authController.signup)

router.post("/signin", [
    check('username', "Имя пользователя не может быть пустым").notEmpty(),
    check('password', 'Пароль пользователя не может быть пустым').notEmpty()
], authController.signin)

router.get("/profile", authMiddleware, authController.profile)

router.post("/photo", [
    authMiddleware,
    fileUpload({}),
    imageMiddleware,
], authController.uploadAvatar)

router.post("/header", [
    authMiddleware,
    fileUpload({}),
    imageMiddleware,
], authController.uploadHeader)

router.post("/aboutMe", [
    authMiddleware,
    check('aboutMe', "Описание профиля не может быть больше 50 символов").isLength({max: 50})
], authController.changeAboutMe)

router.post("/status", [
    authMiddleware,
    check('status', "Статус не можеть быть больше 20 символов").isLength({max: 20})
], authController.changeStatus)

router.post("/addPost", [
    authMiddleware,
    fileUpload({}),
    imageMiddleware,
    check('Title', "Заголовок публикации не может быть пустым").notEmpty(),
    check('Description', "Описание публикации не может быть пустым").notEmpty(),
    check('Title', "Заголовок публикации должен быть не больше 20 символов").isLength({max: 20}),
    check('Description', "Описание публикации должен быть не больше 250 символов").isLength({max: 250})
], authController.addPost)

router.post("/addComment", [
    authMiddleware,
    check('Title', "Заголовок комментария не можеть быть пустым").notEmpty(),
    check('Body', "Описание комментария не можеть быть пустым").notEmpty(),
    check('Title', "Заголовок комментария должен быть не больше 20 символов").isLength({max: 20}),
    check('Title', "Заголовок комментария должен быть не больше 250 символов").isLength({max: 250})
], authController.addComment)

router.post("/likePost", authMiddleware, authController.likePost)

router.post("/likeComment", authMiddleware, authController.likeComment)

router.post("/disLikePost", authMiddleware, authController.disLikePost)

router.post("/disLikeComment", authMiddleware, authController.disLikeComment)

module.exports = router;
