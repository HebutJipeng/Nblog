var mongodb = require('./db');

function User(user) {
	// body...
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
}

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
	//要存入数据库的用户文档
	var user = {
		name: this.name,
		password: this.password,
		email: this.email 
	};
	//open db
	mongodb.open(function(err, db){
		if (err) {
			return callback(err); //
		}
	});

}

