const {Schema, model} = require('mongoose')

const Role = new Schema({
  NAME: {default: "USER", type: String, unique: true},
})

module.exports = model('Role', Role)
