// player logic class

class player {
    constructor(cards, turn){
        
        // cards held by the player
        // a new deck will will provided during initialization
        this.cards = cards

        // turn of the player
        // 0 -> this player's turn
        // 1 -> next turn
        // and so on...
        this.turn = turn

    }
}