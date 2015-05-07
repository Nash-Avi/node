var express = require('express');
var router = express.Router();
var data = require('../data/data');
var Busboy = require('busboy');
var fs = require('fs');

router.get('/', function(req, res) {

	var query = data.Image.find({}).select('title fileName');

	query.exec(function(err, images) {
		if (err) return console.error(err);

		var imageViewModels = [];

		for(var i=0; i<images.length; i++) {
			imageViewModels.push({
				title: images[i].title,
				fileName: images[i].fileName,
				id: images[i].id
			});
		}

		res.render('image/index', {
			images: imageViewModels	
		});
	});
});

router.get('/upload', function(req, res) {
	res.render('image/upload');
});

router.post('/upload', function(req, res) {
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
