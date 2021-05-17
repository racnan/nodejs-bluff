const http = require('http')

const express = require('express')
const socketio = require('socket.io')

const cors = require('cors')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const roomNamespace = io.of('/room')

const _ = require('./controllers/game')(roomNamespace)
const userRouter = require('./controllers/users')

const PORT = 3000

app.use(cors())

app.use(express.urlencoded({
    extended: true
}))

app.use(userRouter)

server.listen(PORT, () => {
    console.log(`Server is up at port ${PORT}`)
})