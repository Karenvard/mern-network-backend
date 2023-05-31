const router = require("express").Router();
const usersRouter = require("./usersRouter")
const authRouter = require("./authRouter")
const adminRouter = require("./adminRouter")

router.use("/users", usersRouter)
router.use("/auth", authRouter)
router.use("/admin", adminRouter)

module.exports = router;