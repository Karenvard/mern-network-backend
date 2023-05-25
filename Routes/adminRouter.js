const router = require("express").Router();
const adminController = require("../Controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware")


router.post("/role", [authMiddleware, adminMiddleware], adminController.newRole)

module.exports = router;
