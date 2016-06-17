'use strict';

class App {
	constructor() {
		this.loadPackages();
		this.configure();
	}

	loadPackages() {
		this.fs = require('fs');
		this.Sister = require('sister');
		this.request = require('request');
		this.NProgress = require('nprogress');
		this.Datastore = require('nedb');
		this.marked = require('marked');

		require('bootstrap');
	}

	configure() {
		this.NProgress.configure({
			showSpinner: false
		});

		this.emitter = this.Sister();
		this.db = {
			libs: new this.Datastore({
				filename: __dirname + '/db/libs.db'
			}),
			changelogs: new this.Datastore({
				filename: __dirname + '/db/changelogs.db'
			})
		};

		this.marked.setOptions({
			renderer: new this.marked.Renderer(),
			gfm: true,
			tables: true,
			breaks: true,
			pedantic: true,
			sanitize: true,
			smartLists: true,
			smartypants: true
		});

		this.changelogItems = [];
		this.initialStart = false;
		this.progress = {
			total: 0,
			status: 0
		};

		this.documentReady(() => {
			this.configureListeners();
		});
	}

	run() {
		let that = this;

		this.db.libs.loadDatabase((err) => {
			if (err) {
				that.error(err);
				return false;
			}

			this.log('> nedb libs loaded');

			that.db.changelogs.loadDatabase((err) => {
				if (err) {
					that.error(err);
					return false;
				}

				that.log('> nedb changelogs loaded');
				that.emitter.trigger('db-ready');
			});
		});
	}

	documentReady(callback) {
		$(callback);
	}

	setInitialStart(val) {
		this.initialStart = val;
	}

	getInitialStart() {
		return this.initialStart;
	}

	configureListeners() {
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

		this.emitter.on('version-updated', (lib) => {
			var libEl = $('.' + lib.item._id),
				badge = libEl.find('.badge.version');

			badge.html(lib.version);

			if (!that.initialStart && lib.item.columns.isSubscribed) {
				libEl.addClass('updated');
			}

			that.log('> version updated for', lib.item._id, 'to', lib.version);
		});

		this.emitter.on('progress', (total) => {
			if (total) {
				that.progress.total = total;
				that.NProgress.start();
			} else {
				that.NProgress.set(1 / that.progress.total);
				that.progress.status++;
			}

			if (that.progress.total == that.progress.status) {
				that.NProgress.done();
				that.fetchChangelogs();
				that.progress.status = 0;

				$('.update-versions').button('reset');
			}
		});

		let libraries = $('.libraries'),
			mainContent = $('.main-content'),
			updateVersion = $('.update-versions'),
			search = $('.search');

		updateVersion.on('click', (e) => {
			e.preventDefault();

			that.fetchUpdates();
		});

		search.on('input', (e) => {
			that.searchLibraries($(e.target).val(), (err, libs) => {
				if (err) {
					that.error(err);
					return false;
				}

				that.drawLibraries(libs);
			});
		});

		libraries.on('click', '.list-group-item', (e) => {
			e.preventDefault();

			if ($(e.target).hasClass('subscription')) {
				return false;
			}

			let itemEl = $(e.target).closest('.list-group-item');

			$('.libraries .list-group-item').removeClass('selected');
			itemEl.addClass('selected');

			that.showLibContent(itemEl.attr('data-id'));
		});

		libraries.on('click', '.subscription', (e) => {
			e.preventDefault();

			that.changeSubscription(
				$(e.target).closest('a').attr('data-id')
			);
		});

		mainContent.on('click', '.mark-as-done', (e) => {
			e.preventDefault();

			that.markAsDone(
				$(e.target).attr('data-id')
			);
		});
	}

	markAsDone(libId) {
		let that = this;

		this.getLibraryById(libId, (err, lib) => {
			if (err) {
				that.error(err);
				return false;
			}

			that.db.libs.update({
				_id: libId
			}, {
				$set: {
					'columns.pinnedVersion': lib.columns.version
				}
			}, {}, (err) => {
				if (err) {
					that.error(err);
					return false;
				}

				$('.' + libId).removeClass('updated');
				$('.mark-as-done').remove();
				$('.pinned-version').remove();
			});
		});
	}

	changeSubscription(libId) {
		let that = this;

		this.getLibraryById(libId, (err, lib) => {
			let isSubscribed = lib.columns.isSubscribed,
				libEl = $('.' + libId),
				subscriptionEl = libEl.find('.subscription');

			if (err) {
				that.error(err);
				return false;
			}

			that.updateLibSubscription(lib, isSubscribed ? 0 : 1, (err) => {
				if (err) {
					that.error(err);
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

	updateLibSubscription(lib, isSubscribed, callback) {
		this.db.libs.update({
			_id: lib._id
		}, {
			$set: {
				'columns.isSubscribed': isSubscribed,
				'columns.pinnedVersion': isSubscribed ? lib.columns.pinnedVersion : lib.columns.version
			}
		}, {}, callback);
	}

	showLibContent(libId) {
		let that = this;

		this.getLibraryById(libId, (err, lib) => {
			if (err) {
				that.error(err);
				return false;
			}

			that.getChangelogs(lib.uuid, (err, changelogs) => {
				if (err) {
					that.error(err);
					return false;
				}

				that.log('>', changelogs.length, 'changelogs has been found. Trying to draw');

				let markAsDone = '',
					yourVersion = '',
					changelogHtml = '',
					content = $('.main-content');

				if (lib.columns.version != lib.columns.pinnedVersion) {
					markAsDone = ' <a href="#" class="btn btn-success btn-xs mark-as-done" data-id="' + libId + '">Mark as Done</a>';
					yourVersion = '<p class="pinned-version"><span class="text-muted">Your Version:</span> ' + lib.columns.pinnedVersion + '</p>';
				}

				if (changelogs.length) {
					for (let i in changelogs) {
						if (changelogs.hasOwnProperty(i)) {
							let author = '';

							if (
								changelogs[i].author_url &&
								changelogs[i].author_avatar &&
								changelogs[i].author_login
							) {
								author = ' <a href="' + changelogs[i].author_url + '" target="_blank">';

								const authorAvatar = '<img src="' + changelogs[i].author_avatar + '" width="18" height="18">';
								const authorLogin = ' <span class="label label-default">' + changelogs[i].author_login + '</span>';

								author += authorAvatar + authorLogin + '</a>';
							}

							const releasedOn = changelogs[i].published_at
								? ' released on <strong>' + (new Date(changelogs[i].published_at)).toLocaleString("hy-AM") + '</strong>'
								: '';

							changelogHtml += '<p class="text-muted">' +
								'<span class="changelog-version text-primary">' + changelogs[i].version + '</span>' +
								'<span class="text-bottom">' +
									author +
									releasedOn +
								'</span>' +
								' <a href="' + changelogs[i].html_url + '" target="_blank" class="btn btn-xs btn-default pull-right">Open</a>' +
							'</p>';
							changelogHtml += '<p>' + that.marked(changelogs[i].body) + '</p>';
						}
					}
				}

				content.html(
					'<h1>' + lib.columns.name + markAsDone + '</h1>' +
					'<p><span class="text-muted">Vendor:</span> ' + lib.columns.author + '</p>' +
					yourVersion +
					'<p><span class="text-muted">Latest Version:</span> ' + lib.columns.version + '</p>' +
					'<p><span class="text-muted">Url:</span> <a href="' + lib.columns.url + '" target="_blank">' + lib.columns.name + '</a></p>' +
					'<h2>Changelog <a href="' + lib.changelog.url + '" class="btn btn-default btn-xs" target="_blank">Open</a></h2>' +
					changelogHtml
				);
			});
		});
	}

	getLibraryById(libId, callback) {
		this.db.libs.findOne({
			_id: libId
		}, callback);
	}

	getAllLibraries(callback) {
		this.log('> select libraries from db');

		this.db.libs.find({}).sort({
			'columns.isSubscribed': -1
		}).exec(callback);
	}

	searchLibraries(name, callback) {
		this.log('> searching libraries by', name);

		if (name == '') {
			this.getAllLibraries(callback);
			return false;
		}

		this.db.libs.find({
			'columns.name': new RegExp(name, 'gi')
		}).sort({
			'columns.isSubscribed': -1
		}).exec(callback);
	}

	getChangelogs(uuid, callback) {
		this.log('> select changelog from db for', uuid);

		this.db.changelogs.find({
			uuid: uuid
		}).sort({
			published_at: -1,
			version: -1
		}).exec(callback);
	}

	drawLibraries(libs) {
		this.log('> drawing libraries');

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

	getSchemas(callback) {
		var that = this;

		this.readFiles(__dirname + '/schemas/', (schemas) => {
			let asyncLoop = require('node-async-loop');

			asyncLoop(schemas, (schema, next) => {
				that.db.libs.insert(schema, (err, lib) => {
					if (err) {
						that.error(err);
						return false;
					}

					that.log('> Schema insert for', schema.uuid);
					next();
				});
			}, (err) => {
				if (err) {
					that.error(err);
					return false;
				}

				callback();
			});
		});
	}

	readFiles(dirname, onSuccess) {
		var schemaList = [],
			that = this;

		this.fs.readdir(dirname, (err, filenames) => {
			if (err) {
				that.error(err);
				return;
			}

			filenames.forEach((filename) => {
				var schemaModule = require(dirname + filename);

				schemaList.push(schemaModule.sch);
			});

			onSuccess(schemaList);
		});
	}

	fetchUpdates() {
		var that = this;

		this.log('> fetching updates');

		$('.update-versions').button('loading');

		this.getAllLibraries((err, libs) => {
			if (err) {
				that.log(err);
				return false;
			}

			that.emitter.trigger('progress', libs.length);

			if (libs.length) {
				for (var i in libs) {
					if (libs.hasOwnProperty(i)) {
						that.fetchUpdate(libs[i]);
					}
				}
			}
		});
	}

	fetchUpdate(item) {
		this.log('> fetching update for', item.uuid, 'with id', item._id);

		let schema = require('./schemas/' + item.uuid + '.js'),
			that = this;

		this.request(item.versionUrl, (err, response, body) => {
			if (err || response.statusCode != 200) {
				that.log(err);
				return false;
			}

			const version = schema.sch.parseVersion(body);

			if (version !== false) {
				if (item.columns.version != version) {
					that.updateVersion(item, version);
				} else {
					that.log('> There is no update for', item.uuid);
				}
			} else {
				that.log('cannot parse version for');
			}

			that.emitter.trigger('progress');
		});
	}

	updateVersion(item, version) {
		let that = this;

		this.log('> updating version of', item.uuid, 'to', version);

		this.db.libs.update({
			_id: item._id
		}, {
			$set: {
				'columns.version': version,
				'columns.pinnedVersion': item.columns.isSubscribed ? item.columns.pinnedVersion : version
			}
		}, {}, (err) => {
			if (err) {
				that.log(err);
				return false;
			}

			that.log('>', item.uuid, 'updated in db from', item.columns.version, 'to', version);

			that.emitter.trigger('version-updated', {
				item: item,
				version: version
			});
		});

		this.prepareForChangelog(item);
	}

	prepareForChangelog(item) {
		this.log('> Preparing to fetch changelog for', item.uuid);

		this.changelogItems[item.uuid] = {
			uuid: item.uuid,
			changelog: item.changelog
		};
	}

	fetchChangelogs() {
		this.log('> Trying to fetch changelogs');

		for (let i in this.changelogItems) {
			if (this.changelogItems.hasOwnProperty(i)) {
				let item = this.changelogItems[i];

				this.removeExistingChangelogs(item.uuid, () => {
					if (item.changelog !== false) {
						if (item.changelog.isGithubRelease) {
							this.handleGithubRelease(item, i);
						}

						if (item.changelog.isInternalHandler) {
							this.handleByCustomHandler(item, i);
						}
					} else {
						this.log('We don\'t have changelog schema for', item.uuid);
					}
				});
			}
		}
	}

	removeExistingChangelogs(uuid, callback) {
		let that = this;

		this.log('> Removing changelogs for.', uuid);
		this.db.changelogs.remove({
			uuid: uuid
		}, {
			multi: true
		}, (err, lib) => {
			if (err) {
				that.log(err);
				return false;
			}

			callback();
		});
	}

	handleByCustomHandler(item, changelogItemIndex) {
		var schema = require('./schemas/' + item.uuid + '.js'),
			that = this;

		this.request(item.changelog.changelogUrl, (err, response, body) => {
			if (err || response.statusCode != 200) {
				that.log(err);
				return false;
			}

			let changelogs = schema.sch.changelog.handle(body);

			// Remove changelog Item from archive, to prevent double fetch
			that.changelogItems.splice(changelogItemIndex, 1);

			that.formatChangelogItems(changelogs, item.uuid, (changelogItems) => {
				that.log('> Inserting changelogs for.', item.uuid);
				that.db.changelogs.insert(changelogItems, (err, lib) => {
					if (err) {
						that.error(err);
						return false;
					}

					that.log('> Changelog Insert.', lib.length, 'objects');
				});
			});
		});
	}

	handleGithubRelease(item, changelogItemIndex) {
		let that = this,
			options = {
				url: item.changelog.releaseUrl,
				headers: {
					'User-Agent': 'Sophos v0.2.1 @ https://github.com/jiromm/sophos'
				}
			};

		this.request(options, (err, response, body) => {
			if (err || response.statusCode != 200) {
				that.log(err);
				return false;
			}

			// Remove changelog Item from archive, to prevent double fetch
			that.changelogItems.splice(changelogItemIndex, 1);

			that.separateGithubReleaseItems(body, item.uuid, (changelogItems) => {
				that.log('> Inserting changelogs for.', item.uuid);
				that.db.changelogs.insert(changelogItems, (err, lib) => {
					if (err) {
						that.error(err);
						return false;
					}

					that.log('> Changelog Insert.', lib.length, 'objects');
				});
			});
		});
	}

	separateGithubReleaseItems(releases, uuid, callback) {
		let releaseList = [];

		releases = JSON.parse(releases);

		if (releases.length) {
			for (let i in releases) {
				if (releases.hasOwnProperty(i)) {
					if (releases[i].prerelease) {
						continue;
					}

					releaseList.push({
						uuid: uuid,
						html_url: releases[i].html_url,
						version: releases[i].tag_name,
						published_at: new Date(releases[i].published_at),
						body: releases[i].body,
						author_login: releases[i].author.login,
						author_avatar: releases[i].author.avatar_url,
						author_url: releases[i].author.html_url,
					});
				}
			}

			callback(releaseList);
		}
	}

	formatChangelogItems(changelogItems, uuid, callback) {
		let changelogItemList = [];

		if (changelogItems.length) {
			for (let i in changelogItems) {
				if (changelogItems.hasOwnProperty(i)) {
					changelogItemList.push({
						uuid: uuid,
						html_url: changelogItems[i].html_url,
						version: changelogItems[i].version,
						published_at: changelogItems[i].date || false,
						body: changelogItems[i].content,
						author_login: false,
						author_avatar: false,
						author_url: false,
					});
				}
			}

			callback(changelogItemList);
		}
	}

	log(...message) {
		console.log(message.join(' '));
	}

	error(message) {
		console.log('%c >>> Error ', 'background: red; color: white', message);
	}
}

module.exports = App;
