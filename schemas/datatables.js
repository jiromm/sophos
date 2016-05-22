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
	parseVersion: function(body) {
		var re = /cdn\.datatables\.net\/(\d+\.\d+\.\d+)\/js\/jquery\.dataTables\.min\.js/gi;
		var m;

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
	}
};
