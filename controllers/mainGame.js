const {
    room1Game,
    room2Game,
    room3Game
} = require('../logic/game')

const {
    USERS
} = require('../data/users')

const games = {
    "room1": room1Game,
    "room2": room2Game,
    "room3": room3Game,
}

// keeps the list of sockeID and their respective rooms 
var socketAndRooms = []

exports = module.exports = function (io) {

    io.on('connection', (socket) => {
        console.log("MG: ", socket.id)

        // When a player enters the game it invokes "intialize",
        // and sends the "username" assigned to that user.
        socket.on('intialize', (username) => {

            var room = ""

            // finds the room of the user using username provided
            for (var i = 0; i < USERS.length; i++) {
                if (USERS[i].username === username) {
                    room = USERS[i].room
                }
            }

            // if user has a room
            if (room) {

                // if the user has not  been assigned a deck
                // i.e. users is entering for the first time
                if (!games[room].playing[username].initialized) {

                    socket.join(room)

                    socketAndRooms.push({
                        socketid: socket.id,
                        room: room,
                        name: username
                    })

                    // update the socketid
                    games[room].playing[username].socketID = socket.id

                    games[room].assignDeck(username)
                    games[room].arrangeDeck(username)
                    games[room].playing[username].initialized = true


                    io.in(room).emit('intialize-resp',
                        games[room].usersAndCardsLeft(),
                        games[room].playing[username].deck,
                        games[room].playing[username].orderedDeck,
                        games[room].currentTurn(),
                        games[room].isFirstTurn())
                }

                // if the user has been assigned a deck but user is now
                // communicating with new socketid
                else {

                    // update the socketid
                    games[room].playing[username].socketID = socket.id
                    socketAndRooms.forEach((user) => {
                        if (user.name === username) {
                            user.socketid = socket.id
                        }
                    })

                    io.in(room).emit('intialize-resp',
                        games[room].usersAndCardsLeft(),
                        games[room].playing[username].deck,
                        games[room].playing[username].orderedDeck,
                        games[room].currentTurn(),
                        games[room].isFirstTurn())
                }
            }
        })

        socket.on('chaal-select', (chaal) => {

            var room = ""

            // finds the room of the user using socketid
            for (var i = 0; i < socketAndRooms.length; i++) {
                if (socketAndRooms[i].socketid === socket.id) {
                    room = socketAndRooms[i].room
                }
            }

            if (room) {
                games[room].playing.currentChaal = chaal

                // send to everyone except the sender
                socket.to(room).emit('chaal-select-resp', chaal)
            }

        })

        socket.on('played-bluff', (cardIndex) => {

            var room = ""
            var username = ""

            // find the username and room by socketid
            for (var i = 0; i < socketAndRooms.length; i++) {
                if (socketAndRooms[i].socketid === socket.id) {
                    room = socketAndRooms[i].room
                    username = socketAndRooms[i].name
                }
            }

            games[room].playBluff(username, cardIndex)
            games[room].arrangeDeck(username)
            games[room].rearrangeUsersAndCardsLeft()

            // send to the sender
            socket.emit('played-resp',
                games[room].usersAndCardsLeft(),
                games[room].playing[username].deck,
                games[room].playing[username].orderedDeck)

            // send to everyone but sender
            socket.to(room).emit('played',
                games[room].usersAndCardsLeft(),
                games[room].currentTurn(),
                games[room].isFirstTurn())

        })

        socket.on('played-fair', (quantity) => {

            var room = ""
            var username = ""

            // find the username and room by socketid
            for (var i = 0; i < socketAndRooms.length; i++) {
                if (socketAndRooms[i].socketid === socket.id) {
                    room = socketAndRooms[i].room
                    username = socketAndRooms[i].name
                }
            }

            games[room].playFair(username, quantity)
            games[room].arrangeDeck(username)
            games[room].rearrangeUsersAndCardsLeft()

            // send to the sender
            socket.emit('played-resp',
                games[room].usersAndCardsLeft(),
                games[room].playing[username].deck,
                games[room].playing[username].orderedDeck)

            // send to everyone but sender
            socket.to(room).emit('played',
                games[room].usersAndCardsLeft(),
                games[room].currentTurn(),
                games[room].isFirstTurn())

        })

        // when player leaves the room
        socket.on('disconnect', () => {})
    })
}