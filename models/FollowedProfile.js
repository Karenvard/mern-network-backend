const {Schema, model} = require("mongoose")

const FollowedProfile = new Schema({
    userId: {type: String, unique: true},
    users: [{
        id: {type: String, required: true},
    }]
})

module.exports = model('FollowedProfile', FollowedProfile)