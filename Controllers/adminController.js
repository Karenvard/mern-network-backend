const Role = require("../models/Role")

class adminController {
    async newRole(req, res) {
        try {
            const {roleName} = req.body
            const {decodedData} = req;
            const adminRole = await Role.findOne({NAME: "ADMIN"});
            if (decodedData.roles.find(role => role._id === adminRole._id && role.NAME === adminRole.NAME)) {

      }
            const candidate = await Role.findOne({value: roleName})
            if (candidate) {
                return res.json({
                    resultCode: 1,
                    error: "Такая роль уже существует"
                })
            }
            const newRole = new Role({value: roleName})
            await newRole.save();
            res.json(newRole)
        } catch (e) {
            res.json({
                resultCode: 1,
                message: "Не удалось добавить роль",
                error: e.message
            })
        }
    }
}

module.exports = new adminController();
