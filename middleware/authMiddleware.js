require("dotenv").config({path: "../../server/.env"})
const jwt = require("jsonwebtoken")

module.exports = function (req, res, next) {
    try {
        if (!req.headers.authorization) {
            return res.json({
                resultCode: 1,
                error: {
                    type: "no-token-error",
                    body: "Пользователь не авторизован"
                }
            })
        }
        const token = req.headers.authorization.split(' ')[1]
        const decodedData = jwt.verify(token, process.env.SECRET_KEY)
        req.decodedData = decodedData
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