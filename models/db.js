var mongodb = require('mongodb');
var settings = require('../settings'),
	Db = mongodb.Db,
	Connection = mongodb.Connection,
	Server = require('mongodb').Server;
module.exports = new Db(settings.db, new Server(settings.host, settings.port), {safe: true});