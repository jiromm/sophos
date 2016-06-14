exports.sch = {
	uuid: 'phantomjs',
	columns: {
		name: 'PhantomJS',
		author: 'Ariya Hidayat',
		url: 'http://phantomjs.org/',
		version: '',
		pinnedVersion: '',
		isSubscribed: 0
	},
	versionUrl: 'http://phantomjs.org/download.html',
	parseVersion: (body) => { return Math.round(Math.random() * 1000);
		let re = /phantomjs-(\d+\.\d+\.\d+)/gi,
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
		isInternalHandler: true,
		url: 'https://raw.githubusercontent.com/ariya/phantomjs/master/ChangeLog',
		handle: (content) => {
			content = content.replace(new RegExp("      *", 'g'), '');
			content = content.replace(new RegExp("    ", 'g'), '');

			let re = /(\d{4}-\d{2}-\d{2}):\sVersion\s(\d+\.\d+\.\d+)([^]*?)(?=\d{4}-\d{2}-\d{2}:\sVersion\s\d+\.\d+\.\d+)/gi,
				matches = [],
				m;

			while ((m = re.exec(content)) !== null) {
				if (m.index === re.lastIndex) {
					re.lastIndex++;
				}

				matches.push({
					date: m[1],
					version: m[2],
					content: m[3],
					html_url: 'https://github.com/ariya/phantomjs/blob/master/ChangeLog'
				});
			}

			return matches;
		}
	}
};
