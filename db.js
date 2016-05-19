var Datastore = require('nedb');

exports.db = new Datastore({
	filename: __dirname + '/db/sophos.db',
	autoload: true
});
