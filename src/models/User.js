const {Schema, model, Types} = require("mongoose");

const Comment = new Schema({
  owner: {type: {_id: Types.ObjectId, name: String, username: String, surname: String}},
  likes: [{userId: Types.ObjectId}],
  title: {type: String, required: true},
  body: {type: String, required: true}
})

const Post = new Schema({
  likes: [{userId: Types.ObjectId}],
  photo: {type: String},
  title: {type: String, required: true},
  body: {type: String, required: true},
  comments: [Comment]
})

const User = new Schema({
    username: {type: String, unique: true, required: true},
    followed: [{type: {_id: Types.ObjectId}}],
    avatar: {type: String},
    header: {type: String},
    status: {type: String},
    aboutMe: {type: String},
    name: {type: String, required: true},
    surname: {type: String, required: true},
    password: {type: String, required: true},
    posts: [Post],
    roles: [{type: String, ref: 'Role'}],
})

module.exports = model('User', User)
