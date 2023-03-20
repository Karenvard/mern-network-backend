const {Schema, model} = require("mongoose")

const Posts = new Schema({
    userId: {type: String, unique: true},
    users: [{
        id: {type: String, required: true},
    }]
})

module.exports = model('Posts', Posts)