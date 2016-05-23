'use strict';

class App {
	constructor() {
		this.loadPackages();
		this.configure();
	}

	loadPackages() {
		this.fs = require('fs');
		this.$ = require('jquery');
		this.Sister = require('sister');
		this.NProgress = require('nprogress');
		this.Datastore = require('nedb');
	}

	configure() {
		window.jQuery = this.$;

		this.NProgress.configure({
			showSpinner: false
		});

		this.emitter = this.Sister();
		this.db = new this.Datastore({
			filename: __dirname + '/db/sophos.db'
		});

		this.initialStart = false;
		this.progress = {
			total: 0,
			status: 0
		};

		this.documentReady(() => {
			this.configureListeners();
		});
	}

	get run() {
		this.db.loadDatabase(this.onDbLoad);
	}

	onDbLoad(err) {
		if (err) {
			this.error(err);
			return false;
		}

		this.log('> nedb loaded');
		this.emitter.trigger('db-ready');
	}

	documentReady(callback) {
		$(callback);
	}

	configureListeners() {
		this.emitter.on('db-ready', () => {
			this.getAllLibraries(function(err, libs) {
				if (libs.length) {
					if (this.initialStart) {
						this.fetchUpdates();
					}

					this.drawLibraries(libs);
				} else {
					this.log('> db is empty');

					this.initialStart = true;

					this.getSchemas(function() {
						emitter.trigger('db-ready');
					});
				}
			});
		});

		this.emitter.on('version-updated', (lib) => {
			var libEl = $('.' + lib.item._id),
				badge = libEl.find('.badge.version');

			badge.html(lib.version);

			if (!this.initialStart && lib.item.columns.isSubscribed) {
				libEl.addClass('updated');
			}

			this.log('> version updated for', lib.item._id, 'to', lib.version);
		});

		this.emitter.on('progress', (total) => {
			var updateBtn = $('.update-versions');

			if (total) {
				this.progress.total = total;
				this.NProgress.start();

				updateBtn.button('loading');
			} else {
				this.NProgress.set(1 / this.progress.total);
				this.progress.status++;
			}

			if (progress.total == this.progress.status) {
				this.NProgress.done();
				this.progress.status = 0;

				updateBtn.button('reset');
			}
		});

		var libraries = $('.libraries'),
			mainContent = $('.main-content'),
			updateVersion = $('.update-versions');

		updateVersion.on('click', (e) => {
			e.preventDefault();

			this.fetchUpdates();
		});

		libraries.on('click', '.list-group-item', (e) => {
			e.preventDefault();

			if ($(e.target).hasClass('subscription')) {
				return false;
			}

			$('.libraries .list-group-item').removeClass('selected');
			$(this).addClass('selected');

			this.showLibContent($(this).attr('data-id'));
		});

		libraries.on('mouseover', '.list-group-item', (e) => {
			e.preventDefault();

			$(this).find('.subscription').removeClass('hide');
			$(this).find('.version').addClass('hide');
		});

		libraries.on('mouseout', '.list-group-item', (e) => {
			e.preventDefault();

			$(this).find('.subscription').addClass('hide');
			$(this).find('.version').removeClass('hide');
		});

		libraries.on('click', '.subscription', (e) => {
			e.preventDefault();

			this.changeSubscription(
				$(e.target).closest('a').attr('data-id')
			);
		});

		mainContent.on('click', '.mark-as-done', (e) => {
			e.preventDefault();

			this.markAsDone(
				$(e.target).attr('data-id')
			);
		});
	}

	static log(message) {
		console.log(message);
	}

	static error(message) {
		console.log('%c >>> Error ', colorize, message);
	}
}
