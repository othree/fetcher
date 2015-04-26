var aster = require("aster");
var concat = require("aster-concat");


aster.src.registerParser('.js', require('aster-parse-babel'));

aster.src(["fetcher.es6.js"])
  .map(concat('fetcher.js'))
  .map(aster.dest('./', {comment: true}))
  .subscribe(aster.runner);
