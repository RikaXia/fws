const sass = require('node-sass'),
    colors = require('colors'),         //https://www.npmjs.com/package/colors
    cp = require('copy'),
    path = require('path'),
    fs = require('fs'),
    pug = require('pug'),
    dir = __dirname,
    imagemin = require('imagemin');

//当前执行路径
const commandPath = process.env.CMDER_START;


// let html = pug.renderFile(
//     `${commandPath}/app/demo/src/pug/index.pug`,
//     {
//         doctype:'html',
//         pretty:true,
//         globals:,
//     }
// );

let fn = pug.compileFile(
    `${commandPath}/app/demo/src/pug/index.pug`,
    {
        doctype:'html',
        pretty:true
    }
);

//delete require.cache[require.resolve(`${commandPath}/app/demo/src/data/index`)];

let data = require(`${commandPath}/app/demo/src/data/index`);
console.log(data);

let html = fn(data);

console.log('html',html);

// console.log(1 + 2);

// var argv;
// try {
// argv = JSON.parse(process.env.npm_config_argv).original;
// }	catch(ex) {
// argv = process.argv;
// }

// console.log(process);

