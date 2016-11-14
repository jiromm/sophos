exports.sch = {
	uuid: 'dropzone',
	columns: {
		name: 'Dropzone',
		author: 'Matias Meno',
		url: 'http://www.dropzonejs.com/',
		version: '',
		pinnedVersion: '',
		isSubscribed: 0
	},
	versionUrl: 'https://raw.githubusercontent.com/enyo/dropzone/master/package.json',
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
		releaseUrl: 'https://api.github.com/repos/enyo/dropzone/releases',
		url: 'https://github.com/enyo/dropzone/releases'
	}
};
