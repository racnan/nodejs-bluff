const express = require('express')

const {USERS} = require('../data/users.js')


const router = new express.Router()

router.post('/login', (req, res) => {

    //Search for the username
    for (var i = 0; i < USERS.length; i++) {

        //Username match
        if (USERS[i].username === req.body.username) {

            // Password and Username match
            if (USERS[i].password === req.body.password) {
                return res.status(200).send()
            }

            //Incorrect password
            else {
                return res.status(401).send()
            }
        }
    }

    //Incorrect username
    return res.status(401).send()
})

module.exports = router