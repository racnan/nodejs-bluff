const {
    Game
} = require('../logic/logic')

const room1Game = new Game(state = "inactive")
const room2Game = new Game(state = "inactive")
const room3Game = new Game(state = "inactive")

const games = {
    "room1": room1Game,
    "room2": room2Game,
    "room3": room3Game,
}

exports = module.exports = function (io) {

    io.on('connection', (socket) => {

        console.log('conectted');
        // When a player enters the game it invokes "join",
        // and sends the "room" assigned to that user.
        // this function sends state of that room  as 
        // response.
        socket.on('join', (room) => {
            console.log('join')
            socket.emit("join-resp", games[room].state)
        })
 
        // When the room state is not "active", client will invoke "playing".
        // This returns, the name of the host & list of users in the room
        socket.on('playing',(room, username) => {
            games[room].addPlayer(username, socket.id)
            
            if (game[room].state === "inactive"){
                game[room].state = "active"
            }

            socket.emit("playing-resp",{
                host: games[room].getHost(),
                listOfPlayers: game[room].getListofPlayers(),
                state: game[room].state
            })
        })

    })

}