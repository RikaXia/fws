'use strict';
const path = require('path');
const fs = require('fs');

const pug = require('pug');

const pathInfo = require('./getPathInfo');
const getType = require('./getType');
const tip = require('./tip');
const mdDir = require('./mdDir');

let pug2html = (src,dist,obj)=>{
    let outNameIntact = path.basename(dist),    //包括扩展名的的文件例如：index.css
        outType = path.extname(outNameIntact),  //类型，例如：.css
        outName = path.basename(dist,outType),  //文件名，例如：index
        data = getType(obj) === 'object' ? obj : {},
        fn = pug.compileFile(src,{
            doctype:'html',
            pretty:true
        }),
        html = fn(data);
    
    try {
        mdDir(dist);
        fs.writeFile(dist,html,(err)=>{
            if(!err){
                tip.success(`${dist} 写入成功`)
            };
        });
    } catch (error) {
        tip.error(error);
    };
};

module.exports = pug2html;