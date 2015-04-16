var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var data = require('../data/data');

var urlEncodedParser = bodyParser.urlencoded({extended: false});

router.get('/add', function(req, res) {
	res.render('article/add');
});

router.post('/add', urlEncodedParser, function(req, res) {
	if(!req.body) return res.sendStatus(400);

	var newArticle = new data.Article({
		title: req.body.title,
		content: req.body.content
	});
	newArticle.save();

	res.redirect('/');
});

module.exports = router;
