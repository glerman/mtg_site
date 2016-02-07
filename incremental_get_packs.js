var request = require('request')
var cheerio = require('cheerio')
var Promise = require('promise')
var mysql = require("./mysql.js")

var DOUBLE_CARD_IDENTIFIER = " / "
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

var decks_stored = 0
var deck_storage_errors = []
var deck_promisses = []
	
function normalize_card_name(card) {
	
	// card.name = card.name.replace('\u00C6', '\u00FB') //TODO: doesn't work //Make mtgtop8.com û unicode match the card cache unicode
	card.name = card.name.replace('\uFFFD', '\u00C6') //Make mtgtop8.com Æ unicode match the card cache unicode

	//TODO: Using the the first part of one-sided cards with 2 parts
	var idx = card.name.indexOf(DOUBLE_CARD_IDENTIFIER)
	if (idx > -1) {
		card.name = card.name.substring(0, idx)
	}
}

function normalize_deck_name(deck) {
	deck.name = deck.name.replace("\'", "\\\'")
}

function resolve_deck_page(body) {
	var deck_cards = []
	var $ = cheerio.load(body);
	var title = $('title').text()
	var deck_name = title.substring(0, title.indexOf("-") - 1)
	
	card_links = $('.G14 div')
	$(card_links).each(function(i, card){
		//The number of instances of this card in this deck
		var amount = $(card).first().contents().filter(function() {
		    return this.type === 'text';
		}).text();
		var card = {
			'amount': amount,
			'name': $(card).children('span').text(),
			'global_id': replaceAll($(card).attr('onclick'), "\'", "").split(',').filter(function(split_part) {
				
				var global_id_candidate = Number(split_part.replace("\'", "").replace("\'", ""))
				return !Number.isNaN(global_id_candidate)  //todo: make this work!
			})[0]
		}
		normalize_card_name(card)
		deck_cards.push(card)
	})
	return {name: deck_name, cards: deck_cards};
}

function process_deck(deck_url, collect_promises_func) {
	var deck_fetch_promise = new Promise(function(resolve, reject) {

		request({
		    url: deck_url,
		    method: 'GET'
		}, function (error, response, body) {			
			console.log("hi")
		  	if (!error && response.statusCode == 200) {
				resolve(resolve_deck_page(body))
		  	}
		  	else{
		  		reject(new Error("Failed fetching deck url: " + deck_url))
		  	}
		})
	}).then(function(name_and_cards) {
		var deck = {
			url: deck_url,
			name: name_and_cards.name,
			deck_cards: name_and_cards.cards,
		}
		normalize_deck_name(deck)
		var store_promise = mysql.store_deck(deck, function(deck, inner_promise,error) {
			collect_promises_func(inner_promise)
			if (error) {
				deck_storage_errors.push({deck_name: deck.name, err: error})	
				console.log("deck storage errors: " + deck_storage_errors.length)
			} else {
				decks_stored++
				console.log("decks_stored: " + decks_stored)
			}			
		})
		collect_promises_func(store_promise)
	})	
	collect_promises_func(deck_fetch_promise)
}

function get_deck(deck_links, collect_promises_func) {
	var deck_amount = deck_links.length
	for (i = 0; i < deck_amount; i++) {
		var url = 'http://mtgtop8.com/' + deck_links[i]
		process_deck(url, collect_promises_func)
	}
}

function get_deck_links(body, page_id) {

	var page_deck_links = []
	var $ = cheerio.load(body);
	var links = $('.hover_tr .S11 a')
	$(links).each(function(i, link){
		page_deck_links.push($(link).attr('href'))
	})
	return page_deck_links
}

function fetch_decks_page(page_id, collect_promises_func) {
	var deck_page_promise = new Promise(function(resolve, reject) {
		request({ 
		    url: 'http://mtgtop8.com/search2',
		    method: 'POST',
		   	form: {
		        current_page: page_id
		    }
		}, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				resolve(get_deck_links(body, page_id))
			} else {
				throw "Failed fetching page " + page_id
			}
		})
	}).then(function(page_deck_links){

		get_deck(page_deck_links, collect_promises_func)
	})
	collect_promises_func(deck_page_promise)
}

function go() {
	mysql.load_card_cache().then(function(){
		console.log("Starting to persist decks from mtgtop8.com")
		var promises = []
		for (i = 1; i <= total_pages; i++) {
			fetch_decks_page(i, function(promise) {
				promises.push(promise)
			})		
		}
		//TODO: make this  wait until all decks where written to DB - add a global promises[] for decks
		Promise.all(promises).then(function() {
			console.log(deck_storage_errors)	
		})
	})	
}

var total_pages = 2166
go()
