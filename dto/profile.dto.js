class ProfileDtoClass {
  constructor(model) {
    this.id = model._id;
    this.username = model.username;
    this.name = model.name;
    this.surname = model.surname;
    this.aboutMe = model.aboutMe;
    this.status = model.status;
    this.avatar = model.avatar;
    this.header = model.header;
    this.posts = model.posts;
    this.followed = model.followed;
  }
}

const ProfileDto = (model) => {
  return new ProfileDtoClass(model);
}

module.exports = ProfileDto;
