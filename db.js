var db = {};
var Datastore = require('nedb');

db.libraries = new Datastore({
	filename: __dirname + '/db/sophos.db',
	autoload: true
});
