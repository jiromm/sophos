exports.sch = {
	uuid: 'jqueryui',
	columns: {
		name: 'jQuery UI',
		author: 'jQuery Foundation, Inc.',
		url: 'http://jqueryui.com/',
		version: '',
		pinnedVersion: '',
		isSubscribed: 0
	},
	versionUrl: 'http://jqueryui.com/',
	parseVersion: (body) => {
		let re = /Download jQuery UI (\d+\.\d+\.\d+)/gi,
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
