'use strict';
//const fs = require('fs');
const fs = require('fs-extra');
const path = require('path');

const sass = require('node-sass');

const tip = require('./tip');                   //提示消息
const pathInfo = require('./getPathInfo');      //获取目标路径信息
// const mdDir = require('./mdDir');


/**
 * scss编译为css
 * 
 * @class Pug2html
 * {
 *  src:'',                 scss文件路径
 *  dist:'',                css输出路径
 *  debug:true,             debug模式将格式化样式，生成map
 *  callback:()=>{}         回调
 * }
 */
class Sass2css{
    constructor(option){
        const _ts = this;

        option = option || {};

        for(let i in option){
            _ts[i] = option[i];
        };

        _ts.debug = _ts.debug === undefined ? true : _ts.debug;

        if(pathInfo(_ts.src).extension === '.scss'){
            _ts.init();
        }else{
            tip.error(_ts.src + ' 不是有效的scss文件')
        };

    }
    init(){
        const _ts = this;
        let outFileName = path.basename(_ts.dist),
            option = {
                file:_ts.src
            };

        if(_ts.debug){
            option.sourceMap = true;
            option.outFile = outFileName;
            option.outputStyle = 'nested';
        }else{
            option.sourceMap = undefined;
            option.outputStyle = 'compressed';
        };

        sass.render(option,(err,result)=>{
            if(err){
                tip.error(err);
            }else{
                fs.ensureDir(path.dirname(_ts.dist),(err)=>{
                    if(err){
                        tip.error(err);
                    }else{
                        //生成编译出的css文件
                        fs.writeFileSync(_ts.dist,result.css);
                        tip.success(_ts.dist + ' 输出成功');

                        //生成map文件
                        if(result.map){
                            let mapPath = _ts.dist + '.map';
                            fs.writeFileSync(mapPath,result.map);
                            tip.success(mapPath + ' 输出成功');
                        };

                        if(typeof _ts.callback === 'function'){
                            _ts.callback();
                        };
                    };
                });
            };
        });

    }
}

module.exports = Sass2css;



// /**
//  * 
//  * @param {string} src sass文件路径
//  * @param {string} dist css输出路径
//  * @param {boolean} isDebug 是否开启调试模式
//  */
// let sass2css = (src,dist,isDebug)=>{
//     let outNameIntact = path.basename(dist),    //包括扩展名的的文件例如：index.css
//         outType = path.extname(outNameIntact),  //类型，例如：.css
//         outName = path.basename(dist,outType),  //文件名，例如：index
//         option = {};

//     option.file = src;

//     //设置编译选项
//     if(isDebug){
//         option.sourceMap = true;
//         option.outFile = outNameIntact;        
//         option.outputStyle = 'nested';
//     }else{
//         option.sourceMap = undefined;
//         option.outputStyle = 'compressed';
//     };

    
//     sass.render(option,(err,result)=>{
//         if(err){
//             tip.error(err);
//         }else{
//             try {
//                 //mdDir(dist);
//                 fs.ensureDir(path.dirname(dist),(err)=>{
//                     if(err){
//                         tip.error(err);
//                     }else{
//                         //生成编译出的css文件
//                         fs.writeFileSync(dist,result.css);
//                         tip.success(`${dist} 输出成功`);

//                         //生成map文件
//                         if(result.map){
//                             fs.writeFileSync(path.resolve(dist,'..',outNameIntact + '.map'),result.map);
//                             tip.success(`${path.resolve('..',dist + '.map')} 输出成功`);
//                         };
//                     };
//                 });                
//             } catch (error) {
//                 tip.error(error);
//             };

//         };
//     });
// };

// module.exports = sass2css;



