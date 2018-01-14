var ObjectID = require('mongodb').ObjectID;
var _dirname = 'D:/laba10';
module.exports = function(app, db) {
  app.get('/', (req, res) => {
    res.sendFile(_dirname + '/index.html');
  });
  app.get('/admin.html', (req, res) => {
    res.sendFile(_dirname + '/admin.html');
  });
  app.get('/contact.html', (req, res) => {
    res.sendFile(_dirname + '/contact.html');
  });
  app.get('/Coment.html', (req, res) => {
    res.sendFile(_dirname + '/Coment.html');
  });

  app.get('/news.html', (req, res) => {
    res.sendFile(_dirname + '/News.html');
  });
  app.get('/Students.html', (req, res) => {
    res.sendFile(_dirname + '/Students.html');
  });
};