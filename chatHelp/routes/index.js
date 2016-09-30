module.exports = function(io, url) {
  var app = require('express');
  var router = app.Router();
  var mongodb = require('mongodb').MongoClient;

  router.get('/', function(req, res, next) {
    res.render('index', {
      title: 'Express'
    });
  });

  mongodb.connect(url, function(err, db) {
    //assert.equal(null, err);
    console.log("index mongodb connected");

    db.close();
  });

  io.on('connection', function(socket) {
    io.emit("socketToMe", "users");
  });

  return router;
}