'use strict';

class App {
	initialStart = false;

	progress = {
		total: 0,
		status: 0
	};

	constructor() {
		this.loadPackages();
		this.configure();

	}

	loadPackages() {
		this.fs = require('fs');
		this.$ = require('jquery');
		this.Sister = require('sister');
		this.NProgress = require('nprogress');
	}

	configure() {
		window.jQuery = this.$;

		this.NProgress.configure({
			showSpinner: false
		});
	}

	get run() {

	}

	set setDb(db) {
		this.db = db;
	}

	get getDb() {
		return this.db;
	}
}
