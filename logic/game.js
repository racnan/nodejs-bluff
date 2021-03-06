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
                initialized : bool
                turn: 
                deck:
                orderedDeck
            },
        } */
        // host has rank = 1, when host leaves the game rank = 2
        // is considered host
        this.playing = {}

        // number of decks selected by the host
        this.numberOfDecks = 1

        // cards per player
        this.cardsPerPlayer = 1

        this.lastChaal = {
            // user: username,
            // play: "bluff",
            numberOfCards: 0
        }

        // OTHER PROPERTIES
        // this.mainDeck : main shuffled deck of the game
        // this.roundDeck : the deck of all the cards played in a round
        // this.currentChaal
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
            rank: size + 1,
            initialized: false
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

    // generates an array with numbers between 0-52
    // where each number represents a card
    newShuffledDeck() {
        var shuffledDeck = [];

        // generating the deck
        for (let i = 0; i < this.numberOfDecks; i++) {
            for (var j = 0; j < 52; j++) shuffledDeck.push(j);
        }

        // shuffling the deck
        shuffledDeck = shuffledDeck.sort(() => Math.random() - 0.5);

        this.mainDeck = shuffledDeck

        // create roundDeck
        this.roundDeck = []
    }

    // assigns deck to the provided user
    assignDeck(username) {
        var deck = []

        for (let i = 0; i < this.cardsPerPlayer; i++) {
            deck.push(this.mainDeck.pop())
        }

        this.playing[username].deck = deck
        this.playing[username].turn = this.playing[username].rank
    }

    // returns list with users arranged according to turn
    // and cards left
    usersAndCardsLeft() {
        var list = []

        for (let i = 0; i < Object.keys(this.playing).length; i++) {
            Object.entries(this.playing).forEach(player => {
                if (player[1].turn === i + 1) {

                    // push [name, cardsleft]
                    list.push([player[0], player[1].deck.length])
                }
            })
        }
        return list
    }

    // arrange the decks, 1's will be first then 2's ...
    arrangeDeck(username) {
        var tempdeck = [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]
        var arrangedDeck = []
        var orderedDeck = []

        this.playing[username].deck.forEach((card) => {
            for (let i = 0; i < 13; i++) {
                if (card === i + 1 || card === i + 14 || card === i + 27 || card === i + 40) {
                    tempdeck[i].push(card)
                    continue
                }
            }
        })
        for (let i = 0; i < 13; i++) {
            if (tempdeck[i].length !== 0) {
                tempdeck[i].forEach((card) => {
                    arrangedDeck.push(card)
                })
                orderedDeck.push([i, tempdeck[i].length])
            }
        }
        this.playing[username].deck = arrangedDeck
        this.playing[username].orderedDeck = orderedDeck
    }

    // returns username
    currentTurn() {
        var currTurn = ""
        Object.entries(this.playing).forEach((player) => {
            if (player[1].turn === 1) {
                currTurn = player[0]
            }
        })
        return currTurn
    }

    isFirstTurn() {
        if (this.roundDeck.length === 0) {
            return true
        } else {
            return false
        }
    }

    // update the ranks
    rearrangeUsersAndCardsLeft() {
        Object.entries(this.playing).forEach(player => {
            if (player[1].turn === 1) {
                player[1].turn = Object.keys(this.playing).length;
            } else {
                --player[1].turn
            }
        })
    }

    // when bluff is played
    playBluff(username, listOfIndex) {

        // remove card from the user deck and add it to the round deck
        for (var i = 0; i < listOfIndex.length; i++) {
            this.roundDeck.push(this.playing[username].deck[listOfIndex[i]])
            // later, all the 99 while be removed
            this.playing[username].deck[listOfIndex[i]] = 99;
        }

        var i = 0
        var j = 0
        while (j < listOfIndex.length) {
            if (this.playing[username].deck[i] === 99) {
                this.playing[username].deck.splice(i, 1);
                j++
            } else {
                i++;
            }
        }

        this.lastChaal = {
            user: username,
            play: "bluff",
            numberOfCards: listOfIndex.length
        }
    }

    playFair(username, quantity) {

        // remove card from the user deck and add it to the round deck
        var i = 0
        var j = 0
        while (j < quantity) {
            if (this.playing[username].deck[i] === this.currentChaal) {
                this.roundDeck.push(this.playing[username].deck.splice(i, 1));
                j++
            } else {
                i++;
            }
        }
    }

    bluffCaught(username) {

        var caughtUser = this.lastChaal.user
        this.playing[caughtUser].deck.push(...this.roundDeck)
        this.roundDeck = []

        var userTurn = this.playing[username].turn
        Object.entries(this.playing).forEach(player => {
            if (player[1].turn > userTurn) {
                player[1].turn = player[1].turn - userTurn + 1
            } else if (player[1].turn < userTurn) {
                player[1].turn = Object.keys(this.playing).length - (userTurn - player[1].turn) + 1
            }
        })

        this.playing[username].turn = 1
    }

    bluffWrongCall(username){

        var wonUser = this.lastChaal.user
        this.playing[username].deck.push(...this.roundDeck)
        this.roundDeck = []

        var userTurn = this.playing[wonUser].turn
        Object.entries(this.playing).forEach(player => {
            if (player[1].turn > userTurn) {
                player[1].turn = player[1].turn - userTurn + 1
            } else if (player[1].turn < userTurn) {
                player[1].turn = Object.keys(this.playing).length - (userTurn - player[1].turn) + 1
            }
        })

        this.playing[wonUser].turn = 1
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