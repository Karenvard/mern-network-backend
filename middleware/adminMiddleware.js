require("dotenv").config({path: "../../server"})
const jwt = require("jsonwebtoken")

module.exports = function (req, res, next) {
    try {
        if (req.decodedData.id !== process.env.ADMIN_ID) {
            
        }
        next()
    } catch (e) {
        return res.json({
            resultCode: 1,
            error: {
                type: "authMiddleware-catch-error",
                body: e.message,
            }
        })
    }
}