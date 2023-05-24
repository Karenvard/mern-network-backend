const path = require("path");

export class HTTP_Error {

    constructor (res, type, message) {
        if (type && message) {
            this.error = {
                type,
                message
            };
        }
        this.res = res;
    }

    BadRequest() {
        return this.res.status(400).json({
            error: this.error,
        })
    }

    Unauthorized() {
        return this.res.status(401).json({
            error: this.error,
        })
    }

    InternalServerError() {
        return this.res.status(500).json({
            error: this.error,
        })
    }

    NotFound() {
        return this.res.status(404).sendFile(path.resolve(__dirname, "..", "404.html"))
    }
}

export default HTTP_Error;
