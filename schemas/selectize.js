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
		releaseUrl: 'https://api.github.com/repos/selectize/selectize.js/releases'
	}
};
