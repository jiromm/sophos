exports.sch = {
	uuid: 'modernizr',
	columns: {
		name: 'Modernizr',
		author: 'Stu Cox, Paul Irish',
		url: 'http://modernizr.com/',
		version: '',
		pinnedVersion: '',
		isSubscribed: 0
	},
	versionUrl: 'https://raw.githubusercontent.com/Modernizr/Modernizr/master/package.json',
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
	},
	changelog: {
		isGithubRelease: true,
		releaseUrl: 'https://api.github.com/repos/Modernizr/Modernizr/releases'
	}
};
