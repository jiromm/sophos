console.log('> app started');

emitter.on('db-ready', function() {
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

	$('.libraries').on('click', '.list-group-item', function(e) {
		e.preventDefault();

		$('.libraries .list-group-item').removeClass('selected');
		$(this).addClass('selected');

		showLibContent($(this).attr('data-id'));
	});
});

function showLibContent(libId) {
	getLibraryById(libId, function(err, data) {
		if (err) {
			console.error('%c >>> Error ', colorize, err);
			return false;
		}

		$('.main-content').html(
			'<p>' + data.columns.name + '</p>'
		);
	});
}

function getLibraryById(libId, callback) {
	db.findOne({
		_id: libId
	}, callback);
}

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
					'<a href="#' + id + '" class="list-group-item ' + id + '" data-id="' + id + '">' +
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
					console.error('%c >>> Error ', colorize, err);
					return false;
				}

				console.log('> Insert.', newDoc);
				next();
			});
		}, function (err) {
			if (err) {
				console.error('%c >>> Error ', colorize, err);
				return false;
			}

			callback();
		});
	}, function(err) {
		if (err) {
			console.error('%c >>> Error ', colorize, err);
			return false;
		}
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
			console.log('%c >>> Error ', colorize, err);
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

	request(item.versionUrl, function(err, response, body) {
		if (err || response.statusCode != 200) {
			console.log('%c >>> Error ', colorize, err, response);
			return false;
		}

		var version = schema.sch.parseVersion(body);

		if (version !== false) {
			if (item.columns.version != version) {
				updateVersion(item, version);
			} else {
				console.log('> There is no update for', item.uuid);
			}
		} else {
			console.log('%c >>> Error ', colorize, 'cannot parse version for', item.uuid);
		}
	});
}

function updateVersion(item, version) {
	console.log('> updating version of', item.uuid, 'to', version);

	db.update({
		_id: item._id
	}, {
		$set: {
			'columns.version': version
		}
	}, {}, function (err, numReplaced) {
		if (err) {
			console.log('%c >>> Error ', colorize, err);
			return false;
		}

		console.log('>', item.uuid, 'updated in db from', item.columns.version, 'to', version);
		emitter.trigger('version-updated', {
			id: item._id,
			version: version
		});
	});
}
