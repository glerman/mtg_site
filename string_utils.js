var sprintf = require("sprintf-js").sprintf

exports.get_str_unicode = function get_str_unicode(str) {
	var result = "String: " + str
	for (var i = 0; i < str.length; i++) {
		result += sprintf(",%s = %d", str[i], str.charCodeAt(i))
	}
	return result
}

console.log("Hello")

// var str = "\u00C6"
// console.log(exports.get_str_unicode(str))
// var new_str = str.replace('\u00C6', '\u00FB')
// console.log(exports.get_str_unicode(new_str))