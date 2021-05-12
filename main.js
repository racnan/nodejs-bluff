const express = require('express')
const cors = require('cors')

const PORT = 3000
const app = express()

app.use(cors())

app.use(express.urlencoded({
    extended:true
}))

app.post('/login',(req, res) => {
    console.log("working")
    console.log(req.body)
    res.status(200).send()
})

app.listen(PORT, () => {
    console.log(`Server is up at port ${PORT}`)
})