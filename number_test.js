
var arr = {'sdad', 'sad, eqwewq', '0.213', '23132', '0.87873'}
arr.split(',').filter(function(part) {
	if (!Number.isNaN(Number(part))) console.log(part)
})
// console.log(Number('231213'))