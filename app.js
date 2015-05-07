var express = require('express'),
	hbs = require('express-hbs'),
	router_article = require('./routes/article'),
	router_index = require('./routes/index');
	router_image = require('./routes/image');

// -----------------------------
// Library type things that shouldn't be here
String.prototype.toObjectId = function() {
	var ObjectId = (require('mongoose').Types.ObjectId);
	return new ObjectId(this.toString());
};

// -----------------------------
// Express Setup
var app = express();

app.set('view engine', 'hbs');

app.engine('hbs', hbs.express4({
	defaultLayout: __dirname + '/views/layouts/main.hbs',
	layoutsDir: __dirname + '/views/layouts/'
}));


app.set('views', __dirname + '/views');

app.use(express.static('static'));

app.use(function(req, res, next) {
	var userAgent = "", userHost = "";

	if(req.headers !== null) {
		userAgent = req.headers['user-agent'];
		userHost = req.headers.host;
	}

	console.log('New request from [%s] [%s]', userHost, userAgent);

	next();
});

app.use('/article', router_article);
app.use('/image', router_image);
app.use('/', router_index);

var server = app.listen(3000, function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Simple app listening at http://%s:%s', host, port);

});
