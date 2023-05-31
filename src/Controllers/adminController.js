const Role = require("../models/Role");
const {HTTP_Error} = require("../Controllers/errorController")

class adminController {
    async newRole(req, res) {
        try {
            const {roleName} = req.body 
            const candidate = await Role.findOne({NAME: roleName})
            if (candidate) {
                return new HTTP_Error(res, "newrole", "That role is already exists.").BadRequest();
            }
            const newRole = new Role({NAME: roleName})
            await newRole.save();
            return res.status(200).json({message: "Role was created successfully"})
        } catch (e) {
            return new HTTP_Error(res, "newrole", "Server error. Please try to add new role later.").InternalServerError();
        }
    }
}

module.exports = new adminController();
