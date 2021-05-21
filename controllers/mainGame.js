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

        // When a player enters the game it invokes "join",
        // and sends the "room" assigned to that user.
        // this function sends state of that room, number
        // of list of players in that room and host of the as response.
        socket.on('intialize', (username) => {

            var room = ""

            for (var i = 0; i < USERS.length; i++) {
                if (USERS[i].username === username) {
                    room = USERS[i].room
                }
            }

            if (room) {

                socket.join(room)
 
                socketAndRooms.push({
                    socketid: socket.id,
                    room: room
                })

                games[room].updateSocketID(username,socket.id)
                games[room].assignDeck(username)

                // io.to(room).emit('intialize-resp',games[room].)
            }
        })

        // when player leaves the room
        socket.on('disconnect', () => {
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
        })
    })
}