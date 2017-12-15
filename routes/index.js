var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* リモートユーザ(参加者)のページ*/
router.get('/remote_user', function(req, res, next) {
  res.render('remoteUser', { title: 'Express' });
});

/* リモートユーザ(参加者)のページ*/
router.get('/local_user', function(req, res, next) {
  res.render('localUser', { title: 'Express' });
});

module.exports = router;
