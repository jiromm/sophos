exports.sch = {
	uuid: 'jquery2',
	columns: {
		name: 'jQuery 2',
		author: 'jQuery Foundation, Inc.',
		url: 'http://jquery.com/',
		version: '2.0.0',
		pinnedVersion: '2.0.0',
		isSubscribed: 0
	},
	versionUrl: 'http://jquery.com/download/',
	parseVersion: function(body) {
		var re = /Download the compressed, production jQuery (2\.\d+\.\d+)/gi;
		var m;

		while ((m = re.exec(body)) !== null) {
			if (m.index === re.lastIndex) {
				re.lastIndex++;
			}

			console.log(m);

			if (m.length > 1) {
				return m[1];
			}

			return false;
		}
	}
};
