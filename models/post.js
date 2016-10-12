var mongodb = require('./db'),
    markdown = require('markdown').markdown;

function Post(name, title, post, tags) {
    this.name = name;
    this.title = title;
    this.tags = tags;
    this.post = post;
}

module.exports = Post;

Post.prototype.save = function(callback) {
    // body...
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
            date: date,
            year: date.getFullYear(),
            month: date.getFullYear() + '-' + (date.getMonth() + 1),
            day: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
            minute: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
        }
        //要存入数据库的文档
    var post = {
            name: this.name,
            time: time,
            title: this.title,
            tags: this.tags,
            post: this.post,
            comments: []
        }
        //打开数据库
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入 posts 集合
            collection.insert(post, {
                safe: true
            }, function(err) {
                mongodb.close();
                if (err) {
                    return callback(err); //失败，返回err
                }
                callback(null); //返回err 为null
            });
        });
    });
};

//读取文章及其相关信息
Post.getAll = function(name, callback) {
    //打开数据库
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            //根据 query 对象查询文章
            collection.find(query).sort({
                time: -1
            }).toArray(function(err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }

                //解析 markdown 为html
                docs.forEach(function(doc) {
                    doc.post = markdown.toHTML(doc.post);
                });

                callback(null, docs); // 成功！以数组形式返回查询的结果
            });
        });
    });
};

//获取一篇文章
Post.getOne = function(name, day, title, callback) {
    //打开数据库
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            console.log('doc.post2222====>');
            //根据用户名、发表日期及文章名查询
            collection.findOne({
                "name": name,
                "time.day": day,
                "title": title
            }, function(err, doc) {
                console.log('err222222 =====>', doc);
                mongodb.close();
                if (err) {
                    console.log('err =====>', err);
                    return callback(err);
                }
                //解析markdown 为html
                console.log('doc.post====>', doc.post);
                if (doc) {
                    doc.post = markdown.toHTML(doc.post);
                    doc.comments.forEach(function(comment) {
                        comment.content = markdown.toHTML(comment.content);
                    });
                }
                callback(null, doc);
            });
        });
    });
};

//返回原始发表的内容（markdown 格式）
Post.edit = function(name, day, title, callback) {
    //打开数据库
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据用户名、发表日期以及文章名进行查询
            collection.findOne({
                "name": name,
                "time.day": day,
                "title": title
            }, function(err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, doc); //返回查询的一篇文章（markdown格式
            });
        });
    });
};

//更新一篇文章及其相关信息
Post.update = function(name, day, title, post, callback) {
    //打开数据库
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        //读取posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //更新文章内容
            collection.update({
                "name": name,
                "time.day": day,
                "title": title
            }, {
                $set: { post: post }
            }, function(err) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

Post.remove = function(name, day, title, callback) {
    //打开数据库
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据用户名、日期和标题并删除一篇文章
            collection.remove({
                "name": name,
                "time.day": day,
                "title": title
            }, {
                w: 1
            }, function(err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

//目的是一次性取十条，然后可以分页
Post.getTen = function(name, page, callback) {
    mongodb.open(function(err, db) {
    	if (err) {
    		return callback(err)
    	}

    	db.collection('posts', function(err, collection) {
    		if (err) {
    			mongodb.close()
    			return callback(err)
    		}

    		var query = {}
    		if (name) {
    			query.name = name
    		}

    		collection.count(query, function(err, total) {
    			collection.find(query, {
    				skip: (page - 1)*10,
    				limit: 10
    			}).sort({
    				time: -1
    			}).toArray(function(err, docs) {
    				mongodb.close()
    				if (err) {
    					return callback(err)
    				}

    				docs.forEach(function(doc) {
    					doc.post = markdown.toHTML(doc.post)
    				})
    				callback(null, docs, total)
    			})
    		})
    	})
    })
}

//返回所有文章的存档信息
Post.getArchive = (callback) => {
    mongodb.open((err, db) => {
        if (err) {
            callback(err)
        }
        //读取posts集合
        db.collection('posts', (err, collection) => {
            if (err) {
                mongodb.close()
                return callback(err)
            }
            //返回只包含 name / time 、 title属性的文档组成的存档数组
            collection.find({}, {
                'name': 1,
                'time': 1,
                'title': 1
            }).sort({
                time: -1
            }).toArray((err, docs) => {
                mongodb.close()
                if (err) {
                    return callback(err)
                }
                callback(null, docs)
            })
        })
    })
}