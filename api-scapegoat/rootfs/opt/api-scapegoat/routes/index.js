var express = require('express');
var router = express.Router();
var package = require('../package.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'API Scapegoat', version: package.version });
});

module.exports = router;
