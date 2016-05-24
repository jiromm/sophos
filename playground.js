'use strict';

class App {
	var mm = 'message text';

	constructor() {

	}

	run() {
		this.on(this.someE);
	}

	on(callback) {
		callback(this.mm);
	}

	someE(text) {
		console.log(text);
	}
}

let app = new App();
app.run();
