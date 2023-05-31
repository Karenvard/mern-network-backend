const uuid = require("uuid");
const path = require("path");
const { HTTP_Error } = require("../Controllers/errorController");
module.exports = function (req, res, next) {
    try {
        if (!req.files) {
            return new HTTP_Error(res, "image", "Image was not sended.").BadRequest();
        }
        const {photo} = req.files
        const format = '.' + photo.mimetype.split('/')[1]
        if (format !== ".jpg" && format !== ".png" && format !== ".jpeg" && format !== ".raw" && format !== ".tiff" && format !== ".bmp" && format !== ".jp2" && format !== ".webp") {
            return new HTTP_Error(res, "image", "File is not equal to image format.").BadRequest();
        }
        const fileName = uuid.v4() + format
        photo.mv(path.resolve(__dirname, '..', 'static', fileName))
        req.fileName = fileName
        next()
    } catch (e) {
        return new HTTP_Error(res, "image", "Server error. Please try upload image later.").InternalServerError();
    }
}
