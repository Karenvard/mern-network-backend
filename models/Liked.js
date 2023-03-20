const {Schema, model} = require("mongoose")

const Liked = new Schema({
    userId: {type: String, unique: true},
    posts: [{
        id: {type: String, required: true},
    }],
    comments: [{
        id: {type: String, required: true},
    }]
})

module.exports = model('Liked', Liked)