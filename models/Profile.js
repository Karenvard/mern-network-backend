const {Schema, model} = require("mongoose")

const Profile = new Schema({
    userId: {type: String, unique: true},
    name: {type: String, required: true},
    login: {type: String, required: true, unique: true},
    vorname: {type: String, required: true},
    aboutMe: {type: String},
    status: {type: String},
    photos: {
        large: {type: String},
        small: {type: String}
    },
    posts: [
        {
            type: {
                Title: {type: String, required: true},
                Description: {type: String, required: true},
                Photo: String,
                Likes: Number,
                Liked: {type: Boolean, default: false},
                Comments: [{
                    type: {
                        ownerId: Number,
                        ownerLogin: String,
                        Title: {type: String, required: true},
                        Body: {type: String, required: true},
                        Likes: Number,
                        Liked: {type: Boolean, default: false}
                    }
                }]
            }
        }
    ],
    followed: Boolean,
})

module.exports = model('Profile', Profile)