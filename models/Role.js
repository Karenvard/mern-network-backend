const {Schema, model} = require('mongoose')

const Role = new Schema({
    value: {type: String, default: "USER", unique: true}
})

module.exports = model('Role', Role)