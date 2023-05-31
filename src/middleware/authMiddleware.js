require("dotenv").config();
const jwt = require("jsonwebtoken");
const { HTTP_Error } = require("../Controllers/errorController")

module.exports = function(req, res, next) {
  try {
    if (!req.headers.authorization) {
      return new HTTP_Error(res, "auth", "User is not authorized").BadRequest();
    }
    const token = req.headers.authorization.split(' ')[1];
    console.log(token);
    const decodedData = jwt.verify(token, process.env.SECRET_KEY);
    req.decodedData = decodedData
    next()
  } catch (e) {
    console.log(e);
    return new HTTP_Error(res, "auth", "Server error. Please try again later.").InternalServerError();
  }
}
