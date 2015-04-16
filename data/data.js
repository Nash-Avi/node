var mongoose = require('mongoose');

// -----------------------------
// Mongoose Setup
console.log("init DB...");
mongoose.connect('mongodb://localhost/simpleapp');
var db = mongoose.connection;

var articleSchema = mongoose.Schema({
	title: String,
	content: String
});

var Article = mongoose.model('Article', articleSchema);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
	console.log("init DB done.");
});

module.exports = { Article: Article };
