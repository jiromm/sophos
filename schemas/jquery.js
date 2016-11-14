exports.sch = {
	uuid: 'jquery',
	columns: {
		name: 'jQuery',
		author: 'jQuery Foundation, Inc.',
		url: 'http://jquery.com/',
		version: '',
		pinnedVersion: '',
		isSubscribed: 0
	},
	versionUrl: 'http://jquery.com/download/',
	parseVersion: (body) => {
		let re = /Download the compressed, production jQuery (\d+\.\d+\.\d+)/gi,
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
		isGithubRelease: false,
		isInternalHandler: false,
		url: 'https://blog.jquery.com/'
	}
};
