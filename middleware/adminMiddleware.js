const {HTTP_Error} = require("../Controllers/errorController")

module.exports = async function (req, res, next) {
    try {
        const {decodedData} = req;
        const adminRole = await Role.findOne({NAME: "ADMIN"});
        if (!decodedData.roles.find(role => role._id === adminRole._id && role.NAME === adminRole.NAME)) {
          return new HTTP_Error(res, "admin", "Access denied, no admin role").BadRequest()
        }
        next()
    } catch (e) {
        return new HTTP_Error(res, "admin", "Server error.")
    }
}
