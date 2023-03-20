const uuid = require("uuid");
const path = require("path");
module.exports = function (req, res, next) {
    try {
        if (!req.files) {
            return res.json({
                resultCode: 1,
                error: {
                    type: "no-file-error",
                    body: "Изображение не было загружено"
                }
            })
        }
        const {photo} = req.files
        const format = '.' + photo.mimetype.split('/')[1]
        if (format !== ".jpg" && format !== ".png" && format !== ".jpeg" && format !== ".raw" && format !== ".tiff" && format !== ".bmp" && format !== ".jp2" && format !== ".webp") {
           return res.json({
                resultCode: 1,
                error: {
                    type: "wrong-image-format-error",
                    body: "Файл не соответствует формату изображения"
                }
            })
        }
        const fileName = uuid.v4() + format
        photo.mv(path.resolve(__dirname, '..', 'static', fileName))
        req.fileName = fileName
        next()
    } catch (e) {
        return res.json({
            resultCode: 1,
            error: {
                type: "imageMiddleware-catch-error",
                body: e.message
            }
        })
    }
}