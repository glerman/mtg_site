var mysql = require("./mysql.js")
var Promise = require('promise')

exports.load_card_cache = function load_card_cache() {
	var card_cache_promise = new Promise(function(resolve, reject){
	  mysql.connect()
	  mysql.create_card_cache(-1, function(err, card_cache){

	  	mysql.end()
	    
	    if (err) reject(err)
	    resolve(card_cache)  
	  })
	})
	return Promise.all([card_cache_promise]).then(function(fulfilled){
	  var card_cache = fulfilled[0]
	  console.log("Card cache loaded and contains " + Object.keys(card_cache).length + " cards")
	  return card_cache
	})
}




