exports.sch = {
	uuid: 'datatables',
	columns: {
		name: 'DataTables',
		author: 'SpryMedia Ltd',
		url: 'http://www.datatables.net/',
		version: '',
		pinnedVersion: '',
		isSubscribed: 0
	},
	versionUrl: 'https://raw.githubusercontent.com/DataTables/DataTables/master/package.json',
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
		isGithubRelease: false,
		isInternalHandler: false,
		url: 'https://cdn.datatables.net/releases.html'
	}
};
