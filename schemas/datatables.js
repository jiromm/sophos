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
	versionUrl: 'http://www.datatables.net/',
	parseVersion: (body) => {
		let re = /cdn\.datatables\.net\/(\d+\.\d+\.\d+)\/js\/jquery\.dataTables\.min\.js/gi,
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
