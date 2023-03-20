const Role = require("../models/Role")

class adminController {
    async newRole(req, res) {
        try {
            const {roleName} = req.body
            const candidate = await Role.findOne({value: roleName})
            if (candidate) {
                return res.json({
                    resultCode: 1,
                    error: "Такая роль уже существует"
                })
            }
            const newRole = await new Role({value: roleName})
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