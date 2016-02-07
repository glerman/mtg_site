var sprintf = require("sprintf-js").sprintf
var request = require('request')
var cheerio = require('cheerio')
var Promise = require('promise')
var unorm = require('unorm')
var mysql = require("./mysql.js")

var DOUBLE_CARD_IDENTIFIER = " / "
var Æther_cards_global_ids = [2935,3891,4534,6071,5752,15447,12612,22289,23194,25643,25678,28669,29725,12425,48113,46721,49075,48146,51631,74331,74208,96924,111192,111256,122052,113558,108852,122402,124504,130325,145817,158750,184722,189211,186328,198098,170993,201568,220525,205020,212630,222720,202641,247295,227222,270856,226509,366273,368961,370430,370524,370514,376240,378515,380263,380241,382207,382208,382837,383178,389424,389425,393816,394352,394637,397746,398474,398517,405120,405119]


function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function normalize_card_name(card) {
	// card.name = card.name.replace('\uFFFD', '\u00C6') //Make mtgtop8.com Æ unicode match the card cache unicode
	// card.name = card.name.normalize()

	// console.log(typeof card.name.normalize())
	// console.log(card.name + "-" + card.name.charCodeAt(0))	
	//TODO: Using the the first part of one-sided cards with 2 parts
	var idx = card.name.indexOf(DOUBLE_CARD_IDENTIFIER)
	if (idx > -1) {
		card.name = card.name.substring(0, idx)
	}
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
		var card_log = sprintf("Card name: %s card chars: ", card.name)
		for (i = 0 ; i < card.name.length ; i++) {
			card_log += sprintf("%d - %s, ", card.name.charCodeAt(i), card.name[i])
		}
		// console.log(card_log)
		//todo: create a name char loop and write all unicodes
		deck_cards.push(card)
	})
	return {name: deck_name, cards: deck_cards};
}

function fetch_deck(deck_url) {
	return new Promise(function(resolve, reject) {
		request({
		    url: deck_url,
		    method: 'GET'
		}, function (error, response, body) {
		  	if (!error && response.statusCode == 200) {
				resolve(resolve_deck_page(body))
		  	}
		  	else {
		  		throw "Failed fetching deck " + deck_url
		  	}
		})
	}).then(function(name_and_cards) {
		var deck = {
			url: deck_url,
			name: name_and_cards.name,
			deck_cards: name_and_cards.cards,
		}
		// console.log(deck)
		mysql.store_deck(deck)
		
	})
}



var deck_link = "http://mtgtop8.com/event?e=11230&d=263781&f=MO"


function go() {
	mysql.load_card_cache().then(function(){
		console.log("Starting to persist decks from mtgtop8.com")
		return Promise.all(fetch_deck(deck_link)) 
	})	
}
// var h = "\uFFFD"
// console.log(unorm.nfkc(h).charCodeAt(0))
// go()



var text =
  '\u0EC6 symbol invented by A. J. \u00C5ngstr\u00F6m ' +
  '(1814, L\u00F6gd\u00F6, \u2013 1874) denotes the length ' +
  '10\u207B\u00B9\u2070 m.';

var combining = /[\u0300-\u036F]/g; // Use XRegExp('\\p{M}', 'g'); see example.js.

console.log('Regular:  ' + text.charCodeAt(0));
console.log('NFC:      ' + unorm.nfc(text).charCodeAt(0));
console.log('NFD:      ' + unorm.nfd(text).charCodeAt(0));
console.log('NFKC:     ' + unorm.nfkc(text).charCodeAt(0));
console.log('NFKD: *   ' + unorm.nfkd(text).replace(combining, '').charCodeAt(0));
console.log(' * = Combining characters removed from decomposed form.');