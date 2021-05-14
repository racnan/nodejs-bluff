const express = require('express')

const {USERS} = require('../data/users')
const {auth} = require('../middleware/auth')

const router = new express.Router()

router.get('/room', auth ,(res,req) => {
    
    // try & catch is not used since "cookie not present" 
    // case is handled by auth middleware
    const cookie = req.cookie.token

    for(var i=0; i<USERS.length;i++){

        if (USERS[i].cookie === cookie) {
            // cookie is used to identify the cilent who
            // has sent the request. JSON response will
            // be sent back to the cilent containing the
            // room id which the cilent is allowed to enter.
            
            const roomId = USERS[i].room

            res.status(200).json({"room": roomId})
        }

    }

    // if the cookie match is not found 401 will be sent.
    // Client will then be redirected to login page.
    res.status(401).send()
})

module.exports = router