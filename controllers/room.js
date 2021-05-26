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

// keeps the list of socketID and their respective rooms 
var socketAndRooms = []

// if started is true, then the 
var started = {
    "room1": false,
    "room2": false,
    "room3": false,
};

exports = module.exports = function (io) {

    io.on('connection', (socket) => {

        // When a player enters the game it invokes "join",
        // and sends the "room" assigned to that user.
        // this function sends state of that room, number
        // of list of players in that room and host of the as response.
        socket.on('join', (username) => {

            var room = ""

            for (var i = 0; i < USERS.length; i++) {
                if (USERS[i].username === username) {
                    room = USERS[i].room
                }
            }

            if (room) {

                if (!games[room].playing[username]) {
                    // if there is no such user in the game,
                    // i.e. user has joined for the first time

                    // add user to the "playing" object
                    games[room].addPlayer(username, socket.id)

                    socket.join(room)

                    socketAndRooms.push({
                        socketid: socket.id,
                        room: room
                    })

                    io.to(room).emit('join-resp', games[room].state,
                        games[room].getListofPlayers(),
                        games[room].getHost(),
                        games[room].numberOfDecks,
                        games[room].cardsPerPlayer)

                    if (games[room].state === "inactive") {
                        games[room].state = "waiting"
                    }

                } else {
                    // if the user has already joined the game but
                    // is sending 'join' request again.
                    // this shouldn't happen normally

                    games[room].playing[username].socketID = socket.id

                    io.to(room).emit('join-resp', games[room].state,
                        games[room].getListofPlayers(),
                        games[room].getHost(),
                        games[room].numberOfDecks,
                        games[room].cardsPerPlayer)
                }
            }
        })

        socket.on('update-decks', (username, decks, cardsPerPlayer) => {

            var room = ""

            for (var i = 0; i < USERS.length; i++) {
                if (USERS[i].username === username) {
                    room = USERS[i].room
                }
            }

            if (room) {
                games[room].numberOfDecks = decks
                games[room].cardsPerPlayer = cardsPerPlayer

                io.to(room).emit('join-resp', games[room].state,
                    games[room].getListofPlayers(),
                    games[room].getHost(),
                    games[room].numberOfDecks,
                    games[room].cardsPerPlayer)
            }

        })

        socket.on('start', (username, decks, cardsPerPlayer) => {

            var room = ""

            for (var i = 0; i < USERS.length; i++) {
                if (USERS[i].username === username) {
                    room = USERS[i].room
                    break
                }
            }

            if (room) {
                games[room].numberOfDecks = decks
                games[room].cardsPerPlayer = cardsPerPlayer

                started[room] = true
                games[room].state = "active"

                games[room].newShuffledDeck()

                io.to(room).emit('start-resp')
            }

        })

        // when player leaves the room
        socket.on('disconnect', () => {

            var room = ""

            // find the room which was associated with the socket.id
            // that has dissconnected
            for (var i = 0; i < socketAndRooms.length; i++) {
                if (socketAndRooms[i].socketid === socket.id) {
                    room = socketAndRooms[i].room
                }
            }

            if (room) {

                if (games[room].state !== "active") {

                    games[room].removePlayer(socket.id)

                    if (games[room].state === "waiting") {
                        io.to(room).emit('join-resp', games[room].state,
                            games[room].getListofPlayers(),
                            games[room].getHost(),
                            games[room].numberOfDecks,
                            games[room].cardsPerPlayer)
                    }
                }
            }
        })
    })
}