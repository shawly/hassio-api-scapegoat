var express = require('express');
var os = require('os');
var router = express.Router();
var package = require('../package.json');
var ip = require("ip");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'API Scapegoat', version: package.version, hostname: os.hostname, ip: ip.address() });
});

module.exports = router;
