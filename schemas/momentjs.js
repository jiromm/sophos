exports.sch = {
	uuid: 'momentjs',
	columns: {
		name: 'Moment.js',
		author: 'Tim Wood, Iskren Chernev',
		url: 'http://momentjs.com/',
		version: '',
		pinnedVersion: '',
		isSubscribed: 0
	},
	versionUrl: 'https://raw.githubusercontent.com/moment/moment/develop/package.json',
	parseVersion: (body) => {
		var re = /"version": "(\d+\.\d+\.\d+)"/gi;
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
	},
	changelog: {
		isGithubRelease: false,
		isInternalHandler: true,
		url: 'https://raw.githubusercontent.com/moment/moment/master/CHANGELOG.md',
		handle: (content) => {
			content = content.replace(new RegExp("\n",'g'), '');

			let re = /###\s+(\d+\.\d+\.\d+)(.*?)(?=###)/g,
				matches = [],
				m;

			while ((m = re.exec(content)) !== null) {
				if (m.index === re.lastIndex) {
					re.lastIndex++;
				}

				matches.push({
					version: m[1],
					content: m[2],
					html_url: 'https://raw.githubusercontent.com/moment/moment/master/CHANGELOG.md'
				});
			}

			return matches;
		}
	}
};
