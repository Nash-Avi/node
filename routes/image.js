var express = require('express');
var router = express.Router();
var data = require('../data/data');
var Busboy = require('busboy');
var fs = require('fs');
var path = require('path');
var lwip = require('lwip');
var BaseViewModel = require('../lib/base-viewmodel');

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

		res.render('image/index', new BaseViewModel(req, {
			images: imageViewModels,
			successMessage: req.session.successMessage
		}));
	});
});

router.get('/get/:id/thumbnail', function(req, res) {
	var imageId = req.params.id;

	var query = data.Image.findOne({_id: imageId.toObjectId()})
		.select('data contentType fileName thumbnail');

	query.exec(function(err, image) {
		if (err) return console.error(err);

		res.contentType(image.contentType);

		if(image.thumbnail != null) {
			return res.send(image.thumbnail);
		}

		var extension = path.extname(image.fileName).slice(1);

		lwip.open(image.data, extension, function(err, lwipImage) {
			if (err) return console.error(err);

			lwipImage.contain(150, 150, [255, 255, 255, 0],
				function(err, processedImage) {
					processedImage.toBuffer(extension, function(err, buffer) {
						res.send(buffer);
					});
				}
			);
		});
	});
});

router.get('/get/:id', function(req, res) {
	var imageId = req.params.id;

	var query = data.Image.findOne({_id: imageId.toObjectId()})
		.select('data contentType');

	query.exec(function(err, image) {
		if (err) return console.error(err);

		res.contentType(image.contentType);
		res.send(image.data);
	});
});

router.get('/view/:id', function(req, res) {
	var imageId = req.params.id;

	var query = data.Image.findOne({_id: imageId.toObjectId()})
		.select('title');

	query.exec(function(err, image) {
		res.render('image/view', new BaseViewModel(req,
			{
				title: image.title,
				id: image.id
			}
		));
	});
});

router.get('/upload', function(req, res) {
	res.render('image/upload');
});

function processThumbnail(imageId) {
	var query = data.Image.findOne({_id: imageId.toObjectId()})
		.select('data contentType fileName');

	query.exec(function(err, image) {
		if (err) return console.error(err);

		var extension = path.extname(image.fileName).slice(1);

		lwip.open(image.data, extension, function(err, lwipImage) {
			if (err) return console.error(err);

			lwipImage.contain(150, 150, [255, 255, 255, 0],
				function(err, processedImage) {
					processedImage.toBuffer(extension, function(err, buffer) {
						data.Image.update({_id: imageId.toObjectId()},
							{thumbnail: buffer}).exec();
					});
				}
			);
		});
	});
}

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

			processThumbnail(image.id);

			req.session.successMessage = "Image has been uploaded.";

			res.redirect('/image');
		});
	});

	req.pipe(busboy);
});

module.exports = router;
