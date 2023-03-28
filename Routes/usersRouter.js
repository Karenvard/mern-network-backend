const router = require("express").Router();
const usersController = require("./../Controllers/usersController")
const authMiddleware = require("./../middleware/authMiddleware")

router.get('/data', authMiddleware, usersController.getUsers)
router.get('/follow/:id', authMiddleware, usersController.followUser)
router.get('/unfollow/:id', authMiddleware, usersController.unFollowUser)
router.get('/data/:id', authMiddleware, usersController.getUserById)
router.get('/data-followed', authMiddleware, usersController.getFollowedUsers)
router.post('/start/chat', authMiddleware, usersController.startChat)
router.get('/chats', authMiddleware, usersController.getChats)
router.post('/send/message', authMiddleware, usersController.sendMessage)


module.exports = router;