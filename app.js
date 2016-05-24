'use strict';

class App {
	constructor() {
		App.loadPackages();
		App.configure();
	}

	static loadPackages() {
		App.fs = require('fs');
		App.Sister = require('sister');
		App.NProgress = require('nprogress');
		App.Datastore = require('nedb');
	}

	static configure() {
		App.NProgress.configure({
			showSpinner: false
		});

		App.emitter = App.Sister();
		App.db = new App.Datastore({
			filename: __dirname + '/db/sophos.db'
		});

		this.initialStart = false;
		this.progress = {
			total: 0,
			status: 0
		};

		App.documentReady(() => {
			App.configureListeners();
		});
	}

	run() {
		App.db.loadDatabase(App.onDbLoad);
	}

	static onDbLoad(err) {
		if (err) {
			App.error(err);
			return false;
		}

		App.log('> nedb loaded');
		App.emitter.trigger('db-ready');
	}

	static documentReady(callback) {
		$(callback);
	}

	static setInitialStart(val) {
		this.initialStart = val;
	}

	static getInitialStart() {
		return this.initialStart;
	}

	static configureListeners() {
		var that = this;

		this.emitter.on('db-ready', () => {
			that.getAllLibraries((err, libs) => {
				if (libs.length) {
					if (that.getInitialStart()) {
						that.fetchUpdates();
					}

					that.drawLibraries(libs);
				} else {
					that.log('> db is empty');

					that.setInitialStart(true);

					that.getSchemas(() => {
						that.emitter.trigger('db-ready');
					});
				}
			});
		});

		App.emitter.on('version-updated', (lib) => {
			var libEl = $('.' + lib.item._id),
				badge = libEl.find('.badge.version');

			badge.html(lib.version);

			if (!App.initialStart && lib.item.columns.isSubscribed) {
				libEl.addClass('updated');
			}

			App.log('> version updated for', lib.item._id, 'to', lib.version);
		});

		App.emitter.on('progress', (total) => {
			var updateBtn = $('.update-versions');

			if (total) {
				App.progress.total = total;
				App.NProgress.start();

				updateBtn.button('loading');
			} else {
				App.NProgress.set(1 / App.progress.total);
				App.progress.status++;
			}

			if (progress.total == App.progress.status) {
				App.NProgress.done();
				App.progress.status = 0;

				updateBtn.button('reset');
			}
		});

		var libraries = $('.libraries'),
			mainContent = $('.main-content'),
			updateVersion = $('.update-versions'),
			search = $('.search');

		updateVersion.on('click', (e) => {
			e.preventDefault();

			App.fetchUpdates();
		});

		search.on('input', () => {
			App.searchLibraries($(this).val(), (err, libs) => {
				if (err) {
					App.error(err);
					return false;
				}

				App.drawLibraries(libs);
			});
		});

		libraries.on('click', '.list-group-item', (e) => {
			e.preventDefault();

			if ($(e.target).hasClass('subscription')) {
				return false;
			}

			$('.libraries .list-group-item').removeClass('selected');
			$(this).addClass('selected');

			App.showLibContent($(this).attr('data-id'));
		});

		libraries.on('click', '.subscription', (e) => {
			e.preventDefault();

			App.changeSubscription(
				$(e.target).closest('a').attr('data-id')
			);
		});

		mainContent.on('click', '.mark-as-done', (e) => {
			e.preventDefault();

			App.markAsDone(
				$(e.target).attr('data-id')
			);
		});
	}

	static markAsDone(libId) {
		App.getLibraryById(libId, (err, lib) => {
			if (err) {
				App.error(err);
				return false;
			}

			App.db.update({
				_id: libId
			}, {
				$set: {
					'columns.pinnedVersion': lib.columns.version
				}
			}, {}, (err) => {
				if (err) {
					App.error(err);
					return false;
				}

				$('.' + libId).removeClass('updated');
				$('.mark-as-done').remove();
				$('.pinned-version').remove();
			});
		});
	}

	static changeSubscription(libId) {
		App.getLibraryById(libId, (err, lib) => {
			let isSubscribed = lib.columns.isSubscribed,
				libEl = $('.' + libId),
				subscriptionEl = libEl.find('.subscription');

			if (err) {
				App.error(err);
				return false;
			}

			App.updateLibSubscription(lib, isSubscribed ? 0 : 1, (err) => {
				if (err) {
					App.error(err);
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

	static updateLibSubscription(lib, isSubscribed, callback) {
		App.db.update({
			_id: lib._id
		}, {
			$set: {
				'columns.isSubscribed': isSubscribed,
				'columns.pinnedVersion': isSubscribed ? lib.columns.pinnedVersion : lib.columns.version
			}
		}, {}, callback);
	}

	static showLibContent(libId) {
		App.getLibraryById(libId, (err, lib) => {
			let markAsDone = '',
				yourVersion = '',
				content = $('.main-content');

			if (err) {
				App.error(err);
				return false;
			}

			if (lib.columns.version != lib.columns.pinnedVersion) {
				markAsDone = ' <a href="#" class="btn btn-success btn-xs mark-as-done" data-id="' + libId + '">Mark as Done</a>';
				yourVersion = '<p class="pinned-version"><span class="text-muted">Your Version:</span> ' + lib.columns.pinnedVersion + '</p>';
			}

			content.html(
				'<h2>' + lib.columns.name + markAsDone + '</h2>' +
				'<p><span class="text-muted">Vendor:</span> ' + lib.columns.author + '</p>' +
				yourVersion +
				'<p><span class="text-muted">Latest Version:</span> ' + lib.columns.version + '</p>' +
				'<p><span class="text-muted">Url:</span> <a href="' + lib.columns.url + '" target="_blank">' + lib.columns.name + '</a></p>'
			);
		});
	}

	static getLibraryById(libId, callback) {
		App.db.findOne({
			_id: libId
		}, callback);
	}

	static getAllLibraries(callback) {
		App.log('> select libraries from db');

		App.db.find({}).sort({
			'columns.isSubscribed': -1
		}).exec(callback);
	}

	static searchLibraries(name, callback) {
		App.log('> searching libraries by', name);

		if (name == '') {
			App.getAllLibraries(callback);
			return false;
		}

		App.db.find({
			'columns.name': new RegExp(name, 'gi')
		}).sort({
			'columns.isSubscribed': -1
		}).exec(callback);
	}

	static drawLibraries(libs) {
		App.log('> drawing libraries');

		let libraries = $('.libraries .list-group'),
			that = this;

		libraries.html('');

		if (libs.length) {
			for (let i in libs) {
				if (libs.hasOwnProperty(i)) {
					let id = libs[i]._id,
						additionalClasses = id,
						version = libs[i].columns.version,
						updated = '',
						subscribe = '';

					if (!that.getInitialStart()) {
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

					libraries.append(
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

	static getSchemas(callback) {
		readFiles(__dirname + '/schemas/', (schemas) => {
			let asyncLoop = require('node-async-loop');

			asyncLoop(schemas, (schema, next) => {
				App.db.insert(schema, (err, lib) => {
					if (err) {
						App.error(err);
						return false;
					}

					App.log('> Insert.', lib);
					next();
				});
			}, (err) => {
				if (err) {
					App.error(err);
					return false;
				}

				callback();
			});
		});
	}

	static readFiles(dirname, onSuccess) {
		var schemaList = [];

		App.fs.readdir(dirname, (err, filenames) => {
			if (err) {
				App.error(err);
				return;
			}

			filenames.forEach((filename) => {
				var schemaModule = require(dirname + filename);

				schemaList.push(schemaModule.sch);
			});

			onSuccess(schemaList);
		});
	}

	static fetchUpdates() {
		App.log('> fetching updates');

		App.getAllLibraries((err, libs) => {
			if (err) {
				App.log(err);
				return false;
			}

			App.emitter.trigger('progress', libs.length);

			if (libs.length) {
				for (var i in libs) {
					if (libs.hasOwnProperty(i)) {
						App.fetchUpdate(libs[i]);
					}
				}
			}
		});
	}

	static fetchUpdate(item) {
		App.log('> fetching update for', item.uuid, 'with id', item._id);

		var schema = require('./schemas/' + item.uuid + '.js');
		var request = require("request");

		request(item.versionUrl, (err, response, body) => {
			if (err || response.statusCode != 200) {
				App.log(err);
				return false;
			}

			var version = schema.sch.parseVersion(body);

			if (version !== false) {
				if (item.columns.version != version) {
					App.updateVersion(item, version);
				} else {
					App.log('> There is no update for', item.uuid);
				}
			} else {
				App.log('%c >>> Error ', colorize, 'cannot parse version for', item.uuid);
			}

			App.emitter.trigger('progress');
		});
	}

	static updateVersion(item, version) {
		App.log('> updating version of', item.uuid, 'to', version);

		App.db.update({
			_id: item._id
		}, {
			$set: {
				'columns.version': version,
				'columns.pinnedVersion': item.columns.isSubscribed ? item.columns.pinnedVersion : version
			}
		}, {}, (err) => {
			if (err) {
				App.log(err);
				return false;
			}

			App.log('>', item.uuid, 'updated in db from', item.columns.version, 'to', version);

			App.emitter.trigger('version-updated', {
				item: item,
				version: version
			});
		});
	}

	static log(message) {
		console.log(message);
	}

	static error(message) {
		console.log('%c >>> Error ', colorize, message);
	}
}

module.exports = App;
