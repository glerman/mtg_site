var request = require('request')
var cheerio = require('cheerio')
var Promise = require('promise')
var Duration = require("duration-js");

var fs = require('fs')

function get_deck_links() {

	
	var promises = []
	for (i = 1; i <= total_pages; i++) {

		promises.push(
			new Promise(function(resolve, reject) {
				request({
				    url: 'http://deckbox.org/decks/mtg?p=' + i,
				    method: 'POST'
				    
				}, function (error, response, body) {
				  	if (!error && response.statusCode == 200) {
						var decks = []
						var $ = cheerio.load(body);
						var links = $('table.simple_table tbody tr td a')
						$(links).each(function(i, link){
							decks.push($(link).attr('href'))	
				  		})
						resolve(decks)
				  	}
				  	else{
				  		reject()
				  	}
				})
			})
		)
	}
	return Promise.all(promises)
}


function get_deck_cards(deck_links) {

	var deck_amount = deck_links.length
	var promises = []
	for (i = 0; i < deck_amount; i++) {
		var url = 'http://deckbox.org' + deck_links[i]
		promises.push(
			new Promise(function(resolve, reject) {
				request({
				    url: url,
				    method: 'GET'
				}, function (error, response, body) {
				  	if (!error && response.statusCode == 200) {
						var cards = []
						var $ = cheerio.load(body);
						// card_links = $('.G14 div')
						// $(card_links).each(function(i, card){
						// 	//how many cards of this type are there is a deck
						// 	var amount = $(card).first().contents().filter(function() {
						// 		    return this.type === 'text';
						// 		}).text();
				  //   		cards.push({
				  //   			'amount': amount,
				  //   			'name': $(card).children('span').text(),
				  //   			'global_id': $(card).attr('onclick').split(',')[2]
				  //   		})

				  // 		})
						resolve()
				  	}
				  	else{
				  		reject()
				  	}
				})
			})
		)
	}
	return Promise.all(promises)
}

var total_pages = 50
var start_time = new Date().getTime();

get_deck_links()
.then(function(decks){
	var deck_links = [].concat.apply([], decks)
	get_deck_cards(deck_links)
})
.then(function(){
	var end_time = new Date().getTime()
	var d = new Duration((end_time - start_time) + "ms")
	console.log(d.seconds() + "." + d.milliseconds())
})
