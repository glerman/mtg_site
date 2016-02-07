var mysql = require('mysql')
var sprintf = require("sprintf-js").sprintf
var Promise = require('promise')
var string_utils = require('./string_utils.js')

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Qwer812$',
  database : 'mtg'
})

var connected = false

exports.connect = function connect() {
  if (connected) {
    throw "Already connected to mysql"
  }
  console.log("Connecting to mysql")
  connection.connect()
  connected = true
}

exports.end = function end() {
  if (!connected) {
    throw "Trying to disconnect from mysql, but not connected"
  }
  console.log("Disconnecting from mysql")
  connection.end()
  connected = false
}

var card_cache = undefined

exports.load_card_cache = function load_card_cache() {
  exports.connect()
  if(card_cache) {
    return
  }
  return new Promise(function(resolve, reject){
    create_card_cache(-1, function(err, loaded_card_cache){      
      if (err) reject(err)
      resolve(loaded_card_cache)  
    })
  }).then(function(loaded_card_cache){
    console.log("Card cache loaded and contains " + Object.keys(loaded_card_cache).length + " cards")
    card_cache = loaded_card_cache
  })
}



//Returns an object with card_name->card_db_id mapping which contains all cards in DB
function create_card_cache(limit, callback) {
  var sql = 'SELECT cd_id, cd_name FROM cd_card'
  if (limit > 0 ) sql += ' LIMIT ' + limit
    
  connection.query(sql, function(err, rows, fields) {
    if (err) callback(err)
    
    var card_cache = {}  
    for (i = 0; i < rows.length; i++) {
      var row = rows[i]

      card_cache[row.cd_name] = row.cd_id
    }
    callback(null, card_cache)  
  })  
}

//Not interested in card count ATM
exports.fetch_deck_ids_for_user = function fetch_deck_ids_for_user(user_card_collection_arr, callback) {
  var user_card_collection_str = user_card_collection_arr.toString()
  var sql = "SELECT cdi_mainboard_appearances FROM cdi_card_decks_index WHERE cdi_card_id IN (" + user_card_collection_str + ")"
  
  connection.query(sql, function(err, rows, fields) {
    if (err) callback(err)
    
    var all_deck_ids = []
    for (i = 0; i < rows.length; i++) {
      var row = rows[i]
      var deck_ids_for_one_card = count_and_id_string_to_id_array(row.cdi_mainboard_appearances)
      all_deck_ids.push(deck_ids_for_one_card)
    }  
    callback(null, flatten_array_of_arrays(all_deck_ids))
  })
} 

function flatten_array_of_arrays(arr_of_arrays) {
  return [].concat.apply([], arr_of_arrays)  
}

function count_and_id_string_to_id_array(str) {
  return str.split(",").map(function (count_and_card_id, idx, arr) { 
      return count_and_card_id.substring(count_and_card_id.indexOf("x") + 1)    

    }).filter(function(value) {
      return value != ''
    })
}

//Actually, I want deck id duplicates - it tells me how many unique cards I have from that deck
function filter_duplicates(value, index, arr) { 
    return arr.indexOf(value) === index;
}

exports.fetch_decks = function fetch_decks(deck_ids, callback) {
  var deck_ids_str = deck_ids.toString()
  var sql = "SELECT dk_name, dk_origin_url, dk_mainboard from dk_deck WHERE dk_id IN (" + deck_ids_str + ")"

  connection.query(sql, function(err, rows, fields) {
    if(err) callback(err)

    var decks = []  
    for (i = 0; i < rows.length; i++) {
      var row = rows[i]
      var mainboard_card_ids = count_and_id_string_to_id_array(row.dk_mainboard)
      var deck = {name: row.dk_name, url: row.dk_origin_url, mainboard_cards: mainboard_card_ids}
      decks.push(deck)
    }
    callback(null, decks)    
  })
}


function exec_insert_query(query, expected_affected_rows) {
  return new Promise(function(resolve, reject){ 
    connection.query(query, function(err, rows, fields) {
        if (err) {
          throw sprintf("Error: %s\nIn query: %s", err, query) 
        }
        var actual_affected_rows = rows.affectedRows
        if (expected_affected_rows != actual_affected_rows) {
          throw sprintf("Expected %d affected row but was %d in query: %s", expected_affected_rows, actual_affected_rows, query) 
        }
        resolve(rows)
      })
    })
}

function create_card_to_deck_insert_query(deck, deck_id) {
  var sql = "INSERT INTO ctd_card_to_decks (cda_card_id, cda_deck_id, cda_is_sideboard) VALUES "

  var rows_to_insert = 0
  deck.deck_cards.forEach(function(card, idx, cards){
    if (card.is_sideboard) return //Not supporting sideboard ATM
    
    rows_to_insert++
    sql += sprintf("(%d, %d, %d),", get_card_db_id(card.name), deck_id, 0) //Not supporting sideboard ATM
  })
  sql = sql.substring(0, sql.length - 1) //Remove last comma
  return {sql: sql, rows_to_insert: rows_to_insert}
}

function get_card_db_id(card_name) {
  var card_db_id = card_cache[card_name] 
  if (typeof card_db_id == 'undefined') {
    throw new Error("Failed to find db-id in card cache for card name: " + string_utils.get_str_unicode(card_name))
  }
  return card_db_id     
}

function create_cards_insert_query(deck, deck_id) {
  var cards_sql = "INSERT INTO dc_deck_card (dc_deck_id, dc_card_id, dc_amount, dc_is_sideboard) VALUES "

  var cards_to_insert = 0
  deck.deck_cards.forEach(function(card, idx, cards){
    if (card.is_sideboard) return //Not supporting sideboard atm
    
    cards_to_insert++   
    cards_sql += sprintf("(%d, %d, %d, %d),", deck_id, get_card_db_id(card.name), card.amount, 0) //Not supporting sideboard atm
  })
  cards_sql = cards_sql.substring(0, cards_sql.length - 1) //Remove last comma
  return {cards_sql: cards_sql, cards_to_insert: cards_to_insert}
}

exports.store_deck = function store_deck(deck, callback) {
  
  var deck_sql = sprintf("INSERT INTO dkrf_deck (dkrf_name, dkrf_origin_url) VALUES ('%s', '%s')", deck.name, deck.url)
  
  console.log(deck_sql)
  return exec_insert_query(deck_sql, 1).then(function(rows) {
    var deck_id = rows.insertId
    var res,res_2
    try {
      res = create_cards_insert_query(deck, deck_id)
      res_2 = create_card_to_deck_insert_query(deck, deck_id)  
    } catch (e) {
      console.log("Failed to store deck %s. %s: %s", deck.name, e.name, e.message)
      callback(deck, Promise.resolve("error"), e) //Register the error
    }
    var promisses = []
    promisses[0] = exec_insert_query(res.cards_sql, res.cards_to_insert)
    promisses[1] = exec_insert_query(res_2.sql, res_2.rows_to_insert)
    
    var final_promise = Promise.all(promisses)
    callback(deck, final_promise)
  })
}


