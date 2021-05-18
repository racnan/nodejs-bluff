// Main class for game logic
class Game {

    constructor(state) {

        // state will be "active" when game is being played
        // state will be "inactive" when room is empty
        // state will be "waiting" when game is not started 
        this.state = state

        // playing contains socketid as key with username 
        // and rank as value
        /* {
            socketid : {
                username:username,
                rank: 1
            },
        } */
        // host has rank = 1, when host leaves the game rank = 2
        // is considered host

        this.playing = {}

        // number of decks selected by the host
        this.numberOfDecks = 1

        // cards per player
        this.cardsPerPlayer = 1

    }

    // host is the first user to visit the game.
    // host will control the number of decks used
    // and how many cards each player will get
    // host will also start the game
    getHost() {

        var host = ""
        Object.entries(this.playing).forEach(player => {
            if (player[1].rank === 1) {
                host = player[1].username
            }
        })
        return host
    }

    // returns number of players in room
    getNumberofPlayers() {
        return Object.keys(this.playing).length;
    }

    // return list of players
    getListofPlayers() {
        var list = []

        Object.entries(this.playing).forEach(player => {
            list.push(player[1].username)
        })

        return list
    }

    // adds the username and rank to the playing object
    // with socket.id as the key
    addPlayer(name, socketid) {
        var size = Object.keys(this.playing).length;
        this.playing[socketid] = {
            username: name,
            rank: size + 1
        }
    }

    //removes the username from the playing array
    // by their key
    removePlayer(socketid) {
        var rank = this.playing[socketid].rank

        // if rank = 1 is dissconnected, this will increase rank of 
        // every other user. So, rank = 2 will be now be rank = 1 
        // and hence the "host"
        if (rank === 1) {
            Object.entries(this.playing).forEach(player => {
                --player[1].rank
            })
        } else {
            Object.entries(this.playing).forEach(player => {
                if (player[1].rank > rank) {
                    --player[1].rank
                }
            })
        }

        delete this.playing[socketid];
    }



}

module.exports = {
    Game
}