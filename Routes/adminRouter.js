const router = require("express").Router();
const adminController = require("../Controllers/adminController")


router.post("/role", adminController.newRole)

module.exports = router;