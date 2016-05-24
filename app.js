console.log('> app started');

emitter.on('db-ready', function() {
	getAllLibraries(function(err, libs) {
		if (libs.length) {
			if (initialStart) {
				fetchUpdates();
			}

			drawLibraries(libs);
		} else {
			console.log('> db is empty');

			initialStart = true;

			getSchemas(function() {
				emitter.trigger('db-ready');
			});
		}
	});
});

emitter.on('version-updated', function(lib) {
	var libEl = $('.' + lib.item._id),
			badge = libEl.find('.badge.version');

	badge.html(lib.version);

	if (!initialStart && lib.item.columns.isSubscribed) {
		libEl.addClass('updated');
	}

	console.log('> version updated for', lib.item._id, 'to', lib.version);
});

emitter.on('progress', function(total) {
	var updateBtn = $('.update-versions');

	if (total) {
		progress.total = total;
		NProgress.start();
		updateBtn.button('loading');
	} else {
		NProgress.set(1 / progress.total);
		progress.status++;
	}

	console.log('> status', progress.status);

	if (progress.total == progress.status) {
		NProgress.done();
		progress.status = 0;
		updateBtn.button('reset');
	}
});

$(function() {
	var libraries = $('.libraries'),
		mainContent = $('.main-content');

	$('.update-versions').on('click', function(e) {
		e.preventDefault();

		fetchUpdates();
	});

	$('.search').on('input', function() {
		searchLibraries($(this).val(), function(err, libs) {
			if (err) {
				console.error('%c >>> Error ', colorize, err);
				return false;
			}

			console.log(libs);

			drawLibraries(libs);
		});
	});

	libraries.on('click', '.list-group-item', function(e) {
		e.preventDefault();

		if ($(e.target).hasClass('subscription')) {
			return false;
		}

		$('.libraries .list-group-item').removeClass('selected');
		$(this).addClass('selected');

		showLibContent($(this).attr('data-id'));
	});

	libraries.on('mouseover', '.list-group-item', function(e) {
		e.preventDefault();

		$(this).find('.subscription').removeClass('hide');
		$(this).find('.version').addClass('hide');
	});

	libraries.on('mouseout', '.list-group-item', function(e) {
		e.preventDefault();

		$(this).find('.subscription').addClass('hide');
		$(this).find('.version').removeClass('hide');
	});

	libraries.on('click', '.subscription', function(e) {
		e.preventDefault();

		changeSubscription(
			$(e.target).closest('a').attr('data-id')
		);
	});

	mainContent.on('click', '.mark-as-done', function(e) {
		e.preventDefault();

		markAsDone(
			$(e.target).attr('data-id')
		);
	});
});

function markAsDone(libId) {
	getLibraryById(libId, function(err, lib) {
		if (err) {
			console.error('%c >>> Error ', colorize, err);
			return false;
		}

		db.update({
			_id: libId
		}, {
			$set: {
				'columns.pinnedVersion': lib.columns.version
			}
		}, {}, function(err) {
			if (err) {
				console.error('%c >>> Error ', colorize, err);
				return false;
			}

			$('.' + libId).removeClass('updated');
			$('.mark-as-done').remove();
			$('.pinned-version').remove();
		});
	});
}

function changeSubscription(libId) {
	getLibraryById(libId, function(err, lib) {
		var isSubscribed = lib.columns.isSubscribed,
			libEl = $('.' + libId),
			subscriptionEl = libEl.find('.subscription');

		if (err) {
			console.error('%c >>> Error ', colorize, err);
			return false;
		}

		updateLibSubscription(lib, isSubscribed ? 0 : 1, function(err) {
			if (err) {
				console.error('%c >>> Error ', colorize, err);
				return false;
			}

			if (isSubscribed) {
				libEl.removeClass('subscribed');
				libEl.removeClass('updated');
				subscriptionEl.text('Subscribe');
			} else {
				libEl.addClass('subscribed');
				subscriptionEl.text('Unsubscribe');
			}
		});
	});
}

function updateLibSubscription(lib, isSubscribed, callback) {
	db.update({
		_id: lib._id
	}, {
		$set: {
			'columns.isSubscribed': isSubscribed,
			'columns.pinnedVersion': isSubscribed ? lib.columns.pinnedVersion : lib.columns.version
		}
	}, {}, callback);
}

function showLibContent(libId) {
	getLibraryById(libId, function(err, lib) {
		var markAsDone = '',
			yourVersion = '';

		if (err) {
			console.error('%c >>> Error ', colorize, err);
			return false;
		}

		if (lib.columns.version != lib.columns.pinnedVersion) {
			markAsDone = ' <a href="#" class="btn btn-success btn-xs mark-as-done" data-id="' + libId + '">Mark as Done</a>';
			yourVersion = '<p class="pinned-version"><span class="text-muted">Your Version:</span> ' + lib.columns.pinnedVersion + '</p>';
		}

		$('.main-content').html(
			'<h2>' + lib.columns.name + markAsDone + '</h2>' +
			'<p><span class="text-muted">Vendor:</span> ' + lib.columns.author + '</p>' +
			yourVersion +
			'<p><span class="text-muted">Latest Version:</span> ' + lib.columns.version + '</p>' +
			'<p><span class="text-muted">Url:</span> <a href="' + lib.columns.url + '" target="_blank">' + lib.columns.name + '</a></p>'
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

	db.find({}).sort({
		'columns.isSubscribed': -1
	}).exec(callback);
}

function searchLibraries(name, callback) {
	console.log('> searching libraries by', name);

	if (name == '') {
		getAllLibraries(callback);
		return false;
	}

	db.find({
		'columns.name': new RegExp(name, 'gi')
	}).sort({
		'columns.isSubscribed': -1
	}).exec(callback);
}

function drawLibraries(libs) {
	console.log('> drawing libraries');

	let $libraries = $('.libraries');

	$('.list-group').html('');

	if (libs.length) {
		for (var i in libs) {
			if (libs.hasOwnProperty(i)) {
				var id = libs[i]._id,
					additionalClasses = id,
					version = libs[i].columns.version,
					updated = '',
					subscribe = '';

				if (!initialStart) {
					if (version != libs[i].columns.pinnedVersion) {
						additionalClasses += ' updated';
					}
				}

				if (libs[i].columns.isSubscribed) {
					additionalClasses += ' subscribed';
					subscribe = 'Unsubscribe';
				} else {
					subscribe = 'Subscribe';
				}

				$libraries.find('.list-group').append(
					'<a href="#' + id + '" class="list-group-item ' + additionalClasses + '" data-id="' + id + '">' +
						'<button class="badge subscription btn btn-success hide">' + subscribe + '</button> ' +
						'<span class="badge version">' + version + '</span> ' +
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

		emitter.trigger('progress', libs.length);

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

		emitter.trigger('progress');
	});
}

function updateVersion(item, version) {
	console.log('> updating version of', item.uuid, 'to', version);

	db.update({
		_id: item._id
	}, {
		$set: {
			'columns.version': version,
			'columns.pinnedVersion': item.columns.isSubscribed ? item.columns.pinnedVersion : version
		}
	}, {}, function (err, numReplaced) {
		if (err) {
			console.log('%c >>> Error ', colorize, err);
			return false;
		}

		console.log('>', item.uuid, 'updated in db from', item.columns.version, 'to', version);

		emitter.trigger('version-updated', {
			item: item,
			version: version
		});
	});
}
