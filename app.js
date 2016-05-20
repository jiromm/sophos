emitter.on('db-ready', function() {
	console.log('> app started');

	getAllLibraries(function(err, libs) {
		if (libs.length) {
			drawLibraries(libs);
		} else {
			console.log('> db is empty...');

			getSchemas(function() {
				emitter.trigger('db-ready');
			});
		}
	});
});

function getAllLibraries(callback) {
	console.log('> getting libraries form db...');

	db.find({}, callback);
}

function drawLibraries(libs) {
	console.log('> drawing libraries...');

	let $libraries = $('.libraries');

	if (libs.length) {
		for (var i in libs) {
			if (libs.hasOwnProperty(i)) {
				$libraries.find('.list-group').append(
					'<a href="#" class="list-group-item" data-id="' + libs[i].id + '">' +
						'<span class="badge">' + libs[i].version + '</span> ' +
						libs[i].name +
					'</a>'
				);
			}
		}
	}
}

function getSchemas(callback) {
	readFiles(__dirname + '/schemas/', function(schemas) {
		var asyncLoop = require('node-async-loop');

		asyncLoop(schemas, function (schema, next) {
			db.insert(schema, function (err, newDoc) {
				if (err) {
					console.error('>>> Error: ' + err);
					return false;
				}

				console.log('> Insert.', newDoc);
				next();
			});
		}, function (err) {
			if (err) {
				console.error('>>> Error: ' + err.message);
				return false;
			}

			callback();
		});
	}, function(err) {
		console.log('>>> ', err);
	});
}

function readFiles(dirname, onSuccess, onError) {
	var schemaList = [];

	fs.readdir(dirname, function(err, filenames) {
		if (err) {
			onError(err);
			return;
		}

		filenames.forEach(function(filename) {
			var schemaModule = require(dirname + filename);

			schemaList.push(schemaModule.sch.dbFields);
		});

		onSuccess(schemaList);
	});
}
