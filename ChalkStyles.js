const chalk = require("chalk");

class ChalkStyles {
    errorMSG(msg) {
        return console.log(chalk.bgRgb(255, 0 ,0)(chalk.rgb(0, 0 ,0)(msg)));
    }

    successfulMSG(msg) {
        return console.log(chalk.bgRgb(0, 255 ,0)(chalk.rgb(0, 0 ,0)(msg)));
    }
}

module.exports = new ChalkStyles();