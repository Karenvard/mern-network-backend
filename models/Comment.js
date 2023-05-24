const { Schema, model } = require("mongoose");

const Post = new Schema({
    postId: {type: String, required: true},
    Comments: [{
        type: {
            _id: {type: Schema.Types.ObjectId},
            ownerId: Number,
            ownerLogin: String,
            Title: {type: String, required: true},
            Body: {type: String, required: true},
            Likes: Number,
            LikedArray: [{type: String}],
        }
    }]
})

module.exports = model('Post', Post)