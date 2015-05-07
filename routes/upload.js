var express = require('express');
var router = express.Router();
var data = require('../data/data');
var Busboy = require('busboy');
var fs = require('fs');

router.get('/', function(req, res) {
	res.render('upload/index');
});

router.post('/', function(req, res) {
	var busboy = new Busboy({headers: req.headers});
	var fileBuffer;
	var fileType;
	var fileName;
	var postedFields = {};

	busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
		var fileData = [];
		fileType = mimetype;
		fileName = filename;

		file.on('data', function(data) {
			fileData.push(data);
		});
		file.on('end', function() {
			fileBuffer = Buffer.concat(fileData);
		});
	});
	busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
		postedFields[fieldname] = val;	

	});
	busboy.on('finish', function() {
		var image = new data.Image;
		image.data = fileBuffer;
		image.contentType = fileType;
		image.fileName = fileName;
		image.title = postedFields['imageTitle'];

		image.save(function(err, a) {
			if (err) {
				console.log(err);
				return res.sendStatus(400);
			}

			res.redirect('/');
		});
	});

	req.pipe(busboy);
});

module.exports = router;
