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
	parseVersion: (body) => {
		let re = /"version": "(\d+\.\d+\.\d+)"/gi,
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
		isGithubRelease: true,
		isInternalHandler: false,
		releaseUrl: 'https://api.github.com/repos/Modernizr/Modernizr/releases',
		url: 'https://github.com/Modernizr/Modernizr/releases'
	}
};
