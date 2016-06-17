exports.sch = {
	uuid: 'pnotify',
	columns: {
		name: 'PNotify',
		author: 'Hunter Perrin',
		url: 'https://sciactive.com/pnotify/',
		version: '',
		pinnedVersion: '',
		isSubscribed: 0
	},
	versionUrl: 'https://raw.githubusercontent.com/sciactive/pnotify/master/package.json',
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
		releaseUrl: 'https://api.github.com/repos/sciactive/pnotify/releases',
		url: 'https://github.com/sciactive/pnotify/releases'
	}
};
