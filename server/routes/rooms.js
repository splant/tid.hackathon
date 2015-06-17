var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('rooms/show.jade');
});

module.exports = router;
