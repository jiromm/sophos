exports.sch = {
	uuid: 'daterangepicker',
	columns: {
		name: 'Date Range Picker',
		author: 'Dan Grossman',
		url: 'http://www.daterangepicker.com/',
		version: '',
		pinnedVersion: '',
		isSubscribed: 0
	},
	versionUrl: 'https://raw.githubusercontent.com/dangrossman/bootstrap-daterangepicker/master/package.json',
	parseVersion: function(body) { return Math.random();
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
	},
	changelog: {
		isGithubRelease: true,
		releaseUrl: 'https://api.github.com/repos/dangrossman/bootstrap-daterangepicker/releases'
	}
};
