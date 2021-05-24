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
var started = false;

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

                games[room].addPlayer(username, socket.id)

                socket.join(room)

                io.to(room).emit('join-resp', games[room].state,
                    games[room].getListofPlayers(),
                    games[room].getHost(),
                    games[room].numberOfDecks,
                    games[room].cardsPerPlayer)

                if (games[room].state === "inactive") {
                    games[room].state = "waiting"
                }

                socketAndRooms.push({
                    socketid: socket.id,
                    room: room
                })
            }

        })

        socket.on('update-decks', (data) => {

            decks = data[0]
            cardsPerPlayer = data[1]

            var room = ""

            for (var i = 0; i < socketAndRooms.length; i++) {
                if (socketAndRooms[i].socketid === socket.id) {
                    room = socketAndRooms[i].room
                    games[room].numberOfDecks = decks
                    games[room].cardsPerPlayer = cardsPerPlayer
                }
            }

            if (room) {
                io.to(room).emit('join-resp', games[room].state,
                    games[room].getListofPlayers(),
                    games[room].getHost(),
                    games[room].numberOfDecks,
                    games[room].cardsPerPlayer)
            }

        })

        socket.on('start', (data) => {

            decks = data[0]
            cardsPerPlayer = data[1]

            var room = ""

            for (var i = 0; i < socketAndRooms.length; i++) {
                if (socketAndRooms[i].socketid === socket.id) {
                    room = socketAndRooms[i].room
                    games[room].numberOfDecks = decks
                    games[room].cardsPerPlayer = cardsPerPlayer
                }
            }

            if (room) {
                started = true
                games[room].state = "active"
                games[room].newShuffledDeck()
                io.to(room).emit('start-resp')
            }

        })

        // when player leaves the room
        socket.on('disconnect', () => {
            if (!started) {
                var room = ""

                for (var i = 0; i < socketAndRooms.length; i++) {
                    if (socketAndRooms[i].socketid === socket.id) {
                        room = socketAndRooms[i].room
                        games[room].removePlayer(socket.id)
                    }
                }

                if (room) {
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