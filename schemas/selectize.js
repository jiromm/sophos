exports.sch = {
	uuid: 'selectize',
	columns: {
		name: 'Selectize',
		author: 'Brian Reavis',
		url: 'http://brianreavis.github.io/selectize.js/',
		version: '',
		pinnedVersion: '',
		isSubscribed: 0
	},
	versionUrl: 'https://raw.githubusercontent.com/selectize/selectize.js/master/package.json',
	parseVersion: function(body) {
		var re = /"version": "(\d+\.\d+\.\d+)"/gi;
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
