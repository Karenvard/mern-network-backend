const {Schema, model} = require("mongoose")

const Profile = new Schema({
    userId: {type: String, unique: true},
    name: {type: String, required: true},
    login: {type: String, required: true, unique: true},
    surname: {type: String, required: true},
    aboutMe: {type: String},
    status: {type: String},
    photos: {
        large: {type: String},
        small: {type: String}
    },
    followedUsers: [{type: String}]
})

module.exports = model('Profile', Profile)