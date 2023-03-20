const express = require("express")
const cors = require("cors")
const app = express()
const API_URL = "/1.0/api"
const router = require("./Routes/index")
const mongoose = require('mongoose')
const WSServer = require("express-ws")(app);
const aWSs = WSServer.getWss();
const path = require('path')
const ChalkStyles = require('./ChalkStyles')
require("dotenv").config({path: path.resolve(__dirname, ".env")})
const fileUpload = require('express-fileupload')
app.use(cors())
app.use(express.json())
app.use(API_URL, router)
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(express.static(path.resolve(__dirname, '..')))
app.use(fileUpload({}))

const PORT = process.env.SERVER_PORT

app.ws("/", (ws, req) => {
    ws.on("message", msg => {
        const parsedMSG = JSON.parse(msg)
        switch (parsedMSG.type) {
            case "connection":
                ws.chatID = parsedMSG.chatID;
                break;
            case "message":
                console.log(1);
                aWSs.clients.forEach(client => {
                    console.log(2);
                    if (client.chatID === parsedMSG.chatID) {
                        console.log(3);
                        client.send(JSON.stringify(`${parsedMSG.username}: ${parsedMSG.message}`))
                    }
                })
                break;
        }
    })
})

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        app.listen(PORT, () => {ChalkStyles.successfulMSG(`Server started on - http://localhost:5555`);});
    } catch (e) {
        ChalkStyles.errorMSG(e);
    }
}

start();