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

                if (!USERS[i].isLoggedIn){

                    USERS[i].isLoggedIn = true

                    //sets cookie for further authorization
                    res.cookie("auth",USERS[i].cookie)
                    
                    return res.status(200).send()

                } else {

                    // tells the client that the user has already logged in
                    return res.status(409).send()
                }
                
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