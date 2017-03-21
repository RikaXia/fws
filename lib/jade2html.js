const sass = require('node-sass'),
    colors = require('colors'),         //https://www.npmjs.com/package/colors
    cp = require('copy'),
    path = require('path'),
    fs = require('fs'),
    dir = __dirname,
    imagemin = require('imagemin');

//当前执行路径
const commandPath = process.env.CMDER_START;



var argv;
try {
argv = JSON.parse(process.env.npm_config_argv).original;
}	catch(ex) {
argv = process.argv;
}

console.log(process);

// console.log(process);
