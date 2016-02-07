var mysql = require("./mysql.js")

var user_card_input = [480,605,1801,1858,2251,2352,2353,2449,2862,3077]


function count_group_by(deck_ids) {
	var deck_id_to_user_cards = {}
	for (var i = 0; i < deck_ids.length; ++i) {
	    var obj = deck_ids[i];

	    if (deck_id_to_user_cards[obj] === undefined) {
	    	//If a count for this deck does not exist yet, create
	        deck_id_to_user_cards[obj] = 1 //Assign a count for this deck
	    }
	    else {
	    	//Found another occurance of this deck, increment the count
	    	deck_id_to_user_cards[obj]++
	    }
	}
	return deck_id_to_user_cards
}

mysql.connect()

var deck_id_to_cards_from_input = {}


mysql.fetch_deck_ids_for_user(user_card_input, function (err, deck_ids){
	if(err) {
		throw err
	}
	var deck_id_to_user_cards = count_group_by(deck_ids)
	var decks_to_fetch = Object.keys(deck_id_to_user_cards).sort(function(a, b) {
		return deck_id_to_user_cards[a] - deck_id_to_user_cards[b]
	}).filter(function(v, idx, arr) {
		return idx < 10
	})

	console.log("Decks with most user cards: " + decks_to_fetch)

	mysql.fetch_decks(decks_to_fetch, function(err, decks) {
		if (err) throw err
		
		console.log(decks)	
	})
})
mysql.end

