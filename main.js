const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser ')

const userRouter = require('./controllers/users')

const PORT = 3000
const app = express()

app.use(cors())

app.use(express.urlencoded({
    extended:true
}))

app.use(userRouter)

app.listen(PORT, () => {
    console.log(`Server is up at port ${PORT}`)
})