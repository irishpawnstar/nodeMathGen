var express = require('express');
var session = require('express-session');
var router = express.Router();

/* GET home page. */
router.get('/home', function (req, res, next) {
  res.render("home", { title: "Home" });
});

module.exports = router;
