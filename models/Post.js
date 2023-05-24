const { Schema, model } = require("mongoose");

const Post = new Schema({
    userId: {type: String, required: true},
    posts: [
        {
            type: {
                _id: {type: Schema.Types.ObjectId},
                Title: {type: String, required: true},
                Description: {type: String, required: true},
                Photo: String,
                Likes: Number,
                LikedArray: [{type: String}]
            }
        }
    ]
})

module.exports = model('Post', Post)