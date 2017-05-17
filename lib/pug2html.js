'use strict';
const path = require('path');
const fs = require('fs-extra');

const pug = require('pug');

const pathInfo = require('./getPathInfo');
//const getType = require('./getType');
const tip = require('./tip');

/**
 * pug文件编译成为html
 * 
 * @class Pug2html
 * {
 *  src:'',                 pug文件路径
 *  dist:'',                html输出路径
 *  data:'',                页面数据
 *  debug:true,             debug模式将美化html，且可开启监听服务
 *  callback:()=>{}         回调
 * }
 */
class Pug2html{
    constructor(option){
        const _ts = this;
        option = option || {};

        for(let i in option){
            _ts[i] = option[i];
        };
        _ts.data = _ts.data === undefined ? {} : _ts.data;
        _ts.debug = _ts.debug === undefined ? true : _ts.debug;

        if(pathInfo(_ts.src).extension === '.pug'){
            _ts.init();
        }else{
            tip.error(_ts.src + ' 不是有效的pug文件');
        };
        
    }
    init(){
        const _ts = this;

        let fn = pug.compileFile(_ts.src,{
                doctype:'html',
                pretty:_ts.debug
            }),
            html = fn(_ts.data);

        fs.ensureDir(path.dirname(_ts.dist),(err)=>{
            if(err){
                tip.error(err);
            }else{
                fs.writeFileSync(_ts.dist,html);
                tip.success(_ts.dist + ' 写入成功');
            };
        });  
    }
};

module.exports = Pug2html;

// let pug2html = (src,dist,obj)=>{
//     let outNameIntact = path.basename(dist),    //包括扩展名的的文件例如：index.css
//         outType = path.extname(outNameIntact),  //类型，例如：.css
//         outName = path.basename(dist,outType),  //文件名，例如：index
//         data = getType(obj) === 'object' ? obj : {},
//         fn = pug.compileFile(src,{
//             doctype:'html',
//             pretty:true
//         }),
//         html = fn(data);
//     try {
//         //mdDir(dist);
//         fs.ensureDir(path.dirname(dist),(err)=>{
//             if(err){
//                 tip.error(err);
//             }else{
//                 fs.writeFile(dist,html,(err)=>{
//                     if(!err){
//                         tip.success(`${dist} 写入成功`)
//                     };
//                 });
//             };
//         })
        
//     } catch (error) {
//         tip.error(error);
//     };
// };

// module.exports = pug2html;