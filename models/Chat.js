const {Schema, model} = require("mongoose")

const Chat = new Schema({
    persons: [{userId: String}],
    messages: [{_id: Schema.Types.ObjectId, SenderID: String, text: String}]
})

module.exports = model('Chat', Chat)