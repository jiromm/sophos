exports.sch = {
	uuid: 'jquery2',
	dbFields: {
		name: 'jQuery 2',
		author: 'jQuery Foundation, Inc.',
		url: 'http://jquery.com/',
		version: '2.0.0',
		oldVersion: '2.0.0',
		isSubscribed: 0
	},
	getVersion: function(callback) {
		var request = require("request");

		request("http://jquery.com/download/", function(err, response, body) {
			if (err || response.statusCode != 200) {
				console.log('>>> Error', err, response);
				return false;
			}

			// Regexp pattern /Download the compressed, production jQuery (2\.\d{1,2}\.\d{1,2})/

			callback('1.2.3');
			console.log(body);
		});
	}
};
