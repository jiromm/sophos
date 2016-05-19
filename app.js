$(function() {
	console.log('> start...');

	//db.find({}, function(err, libs) { console.log(libs); });

	getAllLibraries(function(err, libs) {
		if (libs.length) {
			drawLibraries(libs);
		} else {
			console.log('> db is empty...');
			getSchemas(function(fetchedLibs) {
				drawLibraries(fetchedLibs);
			});
		}
	});
});

function getAllLibraries(callback) {
	const libs = [];

	console.log('> getting libraries form db...');
	callback(false, libs);

	//db.find({}, callback);
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
	var libs = [
		{
			_id: 1,
			name: 'jQuery 2',
			version: '1.2.3'
		},
		{
			_id: 2,
			name: 'Twitter Bootstrap 3',
			version: '3.2.1'
		}
	];

	readFiles(__dirname + '/schemas/', function(schemas) {
		schema = schemas;

		if (schema.length) {
			db.insert(schema, function (err, newDoc) {
				console.log('> Insert.', newDoc);
			});
		}

		console.log('> bringing libraries from server...');
		callback(libs);
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

			schemaList[schemaModule.sch.uuid] = schemaModule.sch;
		});

		onSuccess(schemaList);
	});
}
