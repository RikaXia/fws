var fs = require("fs")
var browserify = require('browserify')
var path = require('path')

var babelify = require("babelify");
var exorcist = require('exorcist')
let file = path.join(__dirname,'main.jsx')

browserify({
	entries:file,
	debug:true	
  })
  .transform(babelify,{
	  presets:['es2015','stage-0'],
	  plugins:['transform-react-jsx']
  })
  .bundle()
  .pipe(exorcist("build.js.map"))
  .pipe(fs.createWriteStream("build.js"))