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
		releaseUrl: 'https://api.github.com/repos/dangrossman/bootstrap-daterangepicker/releases',
		url: 'https://github.com/dangrossman/bootstrap-daterangepicker/releases'
	}
};
