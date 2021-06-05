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

// keeps the list of sockeID, username  and their respective rooms 
var socketAndRooms = []

exports = module.exports = function (io) {

    io.on('connection', (socket) => {
        console.log("MG: conn", socket.id)

        // When a player enters the game it invokes "intialize",
        // and sends the "username" assigned to that user.
        socket.on('intialize', (username) => {
            console.log("MG: init ", socket.id)
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
                        username: username
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
                        if (user.username === username) {
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
                games[room].currentChaal = chaal

                // send to everyone except the sender
                socket.to(room).emit('chaal-select-resp', chaal)
            }

        })

        socket.on('played-bluff', (cardIndex) => {
            console.log(cardIndex)
            var room = ""
            var username = ""
            
            // find the username and room by socketid
            for (var i = 0; i < socketAndRooms.length; i++) {
                if (socketAndRooms[i].socketid === socket.id) {
                    room = socketAndRooms[i].room
                    username = socketAndRooms[i].username
                }
            }
            console.log("RS: bluff1 ", games[room])

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
                console.log("RS: bluff ", games[room])
        })

        socket.on('played-fair', (quantity) => {

            var room = ""
            var username = ""

            // find the username and room by socketid
            for (var i = 0; i < socketAndRooms.length; i++) {
                if (socketAndRooms[i].socketid === socket.id) {
                    room = socketAndRooms[i].room
                    username = socketAndRooms[i].username
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

        // when idle, the sockets dissconnect and then reconnects automatically
        // this function will update the socketid of the username
        socket.on("reconnectt", (username) => {
            console.log("MG: reconn")

            var room = ""

            // finds the room of the user using socketid
            for (var i = 0; i < socketAndRooms.length; i++) {
                if (socketAndRooms[i].username === username) {
                    room = socketAndRooms[i].room
                    socketAndRooms[i].socketid = socket.id
                }
            }

            if (room) {
                // update the socketid
                games[room].playing[username].socketID = socket.id
                console.log(games[room].playing)
            }
        })

        // when player leaves the room
        socket.on('disconnect', () => {
            console.log("RS: diss ", socket.id)
            var room = ""
            var user = ""

            // find the room which was associated with the socket.id
            // that has dissconnected
            for (var i = 0; i < socketAndRooms.length; i++) {
                if (socketAndRooms[i].socketid === socket.id) {
                    room = socketAndRooms[i].room
                    user = socketAndRooms[i].username
                }
            }

            if (room) {
                setTimeout(() => removePlayer(user, socket.id, room), 5000);
            }
        })
    })

    function removePlayer(username, socketID, room) {
        // if the player is dissconnected and doesn't reconnects after 10 seconds.
        // the player will be removed from the game.
        console.log("RS: remove function");

        var isReconnected = true;

        // if the username and socketid is not updated, this shows that the user has not reconnected
        for (var i = 0; i < socketAndRooms.length; i++) {
            if (socketAndRooms[i].socketid === socketID && socketAndRooms[i].username === username) {
                console.log("RS: ", socketAndRooms)
                isReconnected = false
            }
        }

        // if user has not reconnected, remove the user
        if (!isReconnected) {
            // change the user's loggedin to false
            for (var i = 0; i < USERS.length; i++) {
                if (USERS[i].username === username) {
                    USERS[i].isLoggedIn = false
                }
            }

            games[room].removePlayer(socketID)

            if (games[room].getListofPlayers().length === 0) {
                // when everyone has left the game

                games[room].state = "inactive"
                

            } else {

                if (games[room].state === "active") {
                    io.in(room).emit('join-resp', games[room].state,
                        games[room].getListofPlayers(),
                        games[room].getHost(),
                        games[room].numberOfDecks,
                        games[room].cardsPerPlayer)
                }

            }
    
        }
    };

}