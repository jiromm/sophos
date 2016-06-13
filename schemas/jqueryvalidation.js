exports.sch = {
	uuid: 'jqueryvalidation',
	columns: {
		name: 'jQuery Validation',
		author: 'Jörn Zaefferer',
		url: 'http://jqueryvalidation.org/',
		version: '',
		pinnedVersion: '',
		isSubscribed: 0
	},
	versionUrl: 'http://jqueryvalidation.org/',
	parseVersion: (body) => {
		let re = /Current version:<\/strong> (\d+\.\d+\.\d+)/gi,
			m;

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
		isGithubRelease: false
	}
};
