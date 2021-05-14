const { USERS } = require('../data/users')

const auth = (req, res, next) => {

    try {
    const cookie = req.cookies.auth
    } catch (_) {

        // 401 will tell the flutter app to redirect
        // the user to the login page, this is done 
        //  if the cookie is not found
        return res.status(401).send()
    }

    for (var i=0;i <USERS.length;i++) {

        if (USERS[i].cookie === cookie) {

            // if the sent cookie is present the user array
            // auth is completed
            return next()

        }

    }
    // 401 will tell the flutter app to redirect
    // the user to the login page, this is done
    // if the cookie didn't match
    return res.status(401).send()

}

module.exports = auth