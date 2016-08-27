var crypto = require('crypto'),
	User = require('../models/user.js');

module.exports = function(app) {
	app.get('/', function(req, res){
		res.render('index', { 
			title: 'Express',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.get('/reg', function(req, res){
		console.log('success==>', req.flash('success').toString());
		console.log('error==>', req.flash('error').toString());
		res.render('reg', {
			title: '注册',
			user: req.session.user,
			success:req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/reg', function(req, res){
		var name = req.body.name,
			password = req.body.password,
			password_re = req.body['password-repeat'];
		//检测两次密码是否一致
		if (password_re != password) {
			req.flash('error', '两次输入的密码不一致！');
			console.log('000');
			return res.redirect('/reg'); //返回注册页
		}
		//生成密码的md5
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');
		var newUser = new User({
			name: name,
			password: password,
			email: req.body.email
		});
		//检测用户名是否已经存在
		User.get(newUser.name, function(err, user) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			if (user) {
				req.flash('error', '用户已存在！')
				console.log('111');
				return res.redirect('/reg'); //返回注册页
			}

			//如果不存在则新增用户
			newUser.save(function(err, user) {
				if (err) {
					req.flash('error', err);
					console.log('333',err);
					return res.redirect('/reg'); //注册失败
				}

				req.session.user = newUser;//用户信息
				req.flash('success', '注册成功');
				res.redirect('/'); //注册成功后返回主页

			});
		});

	});
	app.get('/login', function(req, res){
		res.render('login', {
			title: '登录',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/login', function(req, res){
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');
		//检查用户是否存在
		User.get(req.body.name, function (err, user) {
			if (!user) {
				req.flash('error', '用户不存在！');
				return res.redirect('/login');//用户不存在则跳转到登录页
			}
			//检测密码是否一致
			if (user.password != password) {
				req.flash('error', '密码错误！');//用户密码错误则跳转到登录页
				return res.redirect('/login');
			}
			//用户名 密码都匹配后，将用户信息存入session
			req.session.user = user;
			req.flash('success', '登陆成功');
			res.redirect('/');
		});

	});
	app.get('/post', function(req, res){
		res.render('post', {title: '发表'});
	});
	app.post('/post', function(req, res){

	})
	app.get('/logout', function(req, res){
		req.session.user = null;
		req.flash('success', '登出成功！');
		res.redirect('/');
	});
}
