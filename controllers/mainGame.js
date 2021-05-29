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
        console.log("MG: ",socket.id)

        // When a player enters the game it invokes "intialize",
        // and sends the "username" assigned to that user.
        socket.on('intialize', (username) => {

            var room = ""

            for (var i = 0; i < USERS.length; i++) {
                if (USERS[i].username === username) {
                    room = USERS[i].room
                }
            }

            if (room) {

                if (!games[room].playing[username].initialized) {
                    // console.log(games[room])
                    socket.join(room)

                    socketAndRooms.push({
                        socketid: socket.id,
                        room: room,
                        name: username
                    })

                    games[room].updateSocketID(username, socket.id)
                    games[room].assignDeck(username)
                    games[room].arrangeDeck(username)
                    games[room].playing[username].initialized = true


                    io.in(room).emit('intialize-resp',
                        games[room].usersAndCardsLeft(),
                        games[room].playing[username].deck,
                        games[room].playing[username].orderedDeck,
                        games[room].currentTurn())
                }
                else {
                    games[room].playing[username].socketID = socket.id

                    io.in(room).emit('intialize-resp',
                        games[room].usersAndCardsLeft(),
                        games[room].playing[username].deck,
                        games[room].playing[username].orderedDeck,
                        games[room].currentTurn())
                }
                console.log(games[room].playing[username].orderedDeck)
            }
        })

        socket.on('chaal-select',(chaal) => {

            var room = ""

            for (var i = 0; i < socketAndRooms.length; i++) {
                if (socketAndRooms[i].socketid === socket.id) {
                    room = socketAndRooms[i].room
                }
            }
            
            if (room){
                games[room].playing.currentChaal = chaal
                socket.to(room).emit('chaal-select-resp',chaal)
            }

        })

        // when player leaves the room
        socket.on('disconnect', () => {})
    })
}