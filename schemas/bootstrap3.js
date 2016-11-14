exports.sch = {
	uuid: 'bootstrap3',
	columns: {
		name: 'Twitter Bootstrap 3',
		author: 'Twitter, Inc.',
		url: 'http://getbootstrap.com/',
		version: '',
		pinnedVersion: '',
		isSubscribed: 0
	},
	versionUrl: 'http://getbootstrap.com/',
	parseVersion: (body) => {
		let re = /Currently v(3\.\d+\.\d+)/gi,
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
		releaseUrl: 'https://api.github.com/repos/twbs/bootstrap/releases',
		url: 'https://github.com/twbs/bootstrap/releases'
	}
};
