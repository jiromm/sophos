exports.sch = {
	uuid: 'jquery2',
	columns: {
		name: 'jQuery 2',
		author: 'jQuery Foundation, Inc.',
		url: 'http://jquery.com/',
		version: '',
		pinnedVersion: '',
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

			if (m.length > 1) {
				return m[1];
			}

			return false;
		}

		return false;
	}
};
