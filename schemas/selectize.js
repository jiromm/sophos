exports.sch = {
	uuid: 'selectize',
	columns: {
		name: 'Selectize',
		author: 'Brian Reavis',
		url: 'http://brianreavis.github.io/selectize.js/',
		version: '0.0.0',
		pinnedVersion: '0.0.0',
		isSubscribed: 0
	},
	versionUrl: 'https://raw.githubusercontent.com/brianreavis/selectize.js/master/dist/js/selectize.min.js',
	parseVersion: function(body) {
		var re = /selectize\.js - v(\d+\.\d+\.\d+)/gi;
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
