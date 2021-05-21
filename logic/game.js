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
            username : {
                socketID:socketid,
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
                host = player[0]
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
            list.push(player[0])
        })

        return list
    }

    // adds the username and rank to the playing object
    // with socket.id as the key
    addPlayer(name, socketid) {
        var size = Object.keys(this.playing).length;
        this.playing[name] = {
            socketID: socketid,
            rank: size + 1
        }
    }

    // removes the user from the playing array
    removePlayer(socketid) {
        var user = ""

        Object.entries(this.playing).forEach(player => {
            if (player[1].socketID === socketid) {
                user = player[0]
            }
        })

        var rank = this.playing[user].rank

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

        delete this.playing[user];
    }

    updateSocketID(username, socketid) {
        this.playing[username].socketID = socketid
    }

    // generates an array with numbers between 0-52
    // where each number represents a card
    newShuffledDeck() {
        var shuffledDeck = [];

        // generating the deck
        for (let i = 0; i < this.numberOfDecks; i++) {
            for (var j = 0; j <= 52; j++) shuffledDeck.push(j);
        }

        // shuffling the deck
        shuffledDeck = shuffledDeck.sort(() => Math.random() - 0.5);

        this.deck = shuffledDeck
    }

    // assigns deck to the provided user
    assignDeck(username) {
        var deck = []

        for (let i = 0; i < this.cardsPerPlayer; i++) {
            deck.push(this.deck.pop())
        }

        this.playing[username].deck = deck
    }

}

const room1Game = new Game(state = "inactive")
const room2Game = new Game(state = "inactive")
const room3Game = new Game(state = "inactive")

module.exports = {
    room1Game,
    room2Game,
    room3Game
}