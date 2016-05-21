exports.sch = {
	uuid: 'jquery2',
	columns: {
		name: 'jQuery 2',
		author: 'jQuery Foundation, Inc.',
		url: 'http://jquery.com/',
		version: '2.0.0',
		oldVersion: '2.0.0',
		isSubscribed: 0
	},
	versionUrl: 'http://jquery.com/download/',
	parseVersion: function(body) {
		// Regexp pattern /Download the compressed, production jQuery (2\.\d{1,2}\.\d{1,2})/

		return '1.2.3';
	}
};
