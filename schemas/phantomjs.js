exports.sch = {
	uuid: 'phantomjs',
	columns: {
		name: 'PhantomJS',
		author: 'Ariya Hidayat',
		url: 'http://phantomjs.org/',
		version: '',
		pinnedVersion: '',
		isSubscribed: 0
	},
	versionUrl: 'http://phantomjs.org/download.html',
	parseVersion: function(body) {
		var re = /phantomjs-(\d+\.\d+\.\d+)/gi;
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
