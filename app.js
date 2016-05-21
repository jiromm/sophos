emitter.on('db-ready', function() {
	console.log('> app started');

	getAllLibraries(function(err, libs) {
		if (libs.length) {
			drawLibraries(libs);

			if (initialStart) {
				fetchUpdates();
			}
		} else {
			console.log('> db is empty');

			initialStart = true;

			getSchemas(function() {
				emitter.trigger('db-ready');
			});
		}
	});
});

emitter.on('version-updated', function(item) {
	var badge = $('.' + item.id).find('.badge');

	badge.html(item.version);

	if (!initialStart) {
		badge.addClass('updated');
	}

	console.log('> version updated for', item.id, 'to', item.version);
});

$(function() {
	$('.update-versions').on('click', function(e) {
		e.preventDefault();

		fetchUpdates();
	});
});

function getAllLibraries(callback) {
	console.log('> select libraries from db');

	db.find({}, callback);
}

function drawLibraries(libs) {
	console.log('> drawing libraries');

	let $libraries = $('.libraries');

	if (libs.length) {
		for (var i in libs) {
			if (libs.hasOwnProperty(i)) {
				var id = libs[i]._id;

				$libraries.find('.list-group').append(
					'<a href="#' + id + '" class="list-group-item ' + id + '">' +
						'<span class="badge">' + libs[i].columns.version + '</span> ' +
						libs[i].columns.name +
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

			schemaList.push(schemaModule.sch);
		});

		onSuccess(schemaList);
	});
}

function fetchUpdates() {
	console.log('> fetching updates');

	getAllLibraries(function(err, libs) {
		if (err) {
			console.log('>>> Error', err);
			return false;
		}

		if (libs.length) {
			for (var i in libs) {
				if (libs.hasOwnProperty(i)) {
					fetchUpdate(libs[i]);
				}
			}
		}
	});
}

function fetchUpdate(item) {
	console.log('> fetching update for', item.uuid, 'with id', item._id);

	var schema = require('./schemas/' + item.uuid + '.js');
	var request = require("request");

	request("http://jquery.com/download/", function(err, response, body) {
		if (err || response.statusCode != 200) {
			console.log('>>> Error', err, response);
			return false;
		}

		var version = schema.sch.parseVersion(body);

		if (item.columns.version != version) {
			updateVersion(item, version);
		} else {
			console.log('> There is no update for', item.uuid);
		}
	});
}

function updateVersion(item, version) {
	console.log('> updateing version of', item.uuid, 'with id', item._id, 'to', version);

	db.update({
		_id: item._id
	}, {
		$set: {
			'columns.version': version
		}
	}, {}, function (err, numReplaced) {
		if (err) {
			console.log('>>> Error', err);
			return false;
		}

		console.log('>', item.uuid, 'updated in db from', item.columns.version, 'to', version);
		emitter.trigger('version-updated', {
			id: item._id,
			version: version
		});
	});
}
