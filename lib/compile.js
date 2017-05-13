'use strict';
const fs = require('fs-extra');
const path = require('path');
// const os = require('os');

//const fse = require('fs-extra');

const pathInfo = require('./getPathInfo');
const tip = require('./tip');
const sass2css = require('./sass2css');        //sass编译css
const pug2html = require('./pug2html');        //pug编译html
const ts2js = require('./ts2js');              //typescript编译js
const outSprite = require('./outSprite');      //精灵图处理


//设置文件编译的对应关系
let clinked = {
    'pug':'html',
    'scss':'css',
    'ts':'js',
    'tsx':'jsx'
};

//忽略的目录
let olurDir = {};
for(let i in clinked){
    olurDir[i] = path.join(fws.srcPath,clinked[i]);
};
//console.log('忽略的目录：',olurDir)

/**
 * 处理输入输出目录
 * inPath = {
 *  pug:'/demo/src/pug',
 *  scss:'/demo/src/scss',
 *  ts:'/demo/src/ts',
 *  tsx:'/demo/src/tsx'
 * }
 * 
 * outPath = {
 *  pug:'/demo/dev',
 *  scss:'/demo/dev/css',
 *  js:'/demo/dev/js',
 *  jsx:'/demo/dev/jsx'
 * }
 */
let inPath = {},
    outPath = {};
for(let i in clinked){
    inPath[i] = path.join(fws.srcPath,i);
    outPath[i] = path.join(fws.devPath,clinked[i]);
};


/**
 * 文件路径是否属于要忽略的文件
 * 
 * @param {string} type 文件类型
 * @param {string} sPath 文件路径
 */
let isFileSlur = (type,sPath)=>{
    sPath = path.dirname(sPath);
    return olurDir[type] === sPath;
};

//检查路径是否为data目录文件
let isDataFile = (sPath)=>{
    let dataDirPath = path.join(fws.srcPath,'data','/');
    return sPath.indexOf(dataDirPath) === 0;
};

//是否为图像
// let isImg = (sPath)=>{
//     let imgExtension = ['jpg','jpeg','gif','png','webp','svg','apng'],
//         fileType = path.extname(sPath).toLowerCase();
    
//     return imgExtension.some((item,index)=>{
//         return fileType === '.'+item;
//     });
// };

//是否为非公共目录
let notDir_ = (sPath)=>{
    let aDirList = path.dirname(sPath).split(path.sep);

    //如果是windows路径，则删掉盘符
    if(aDirList[0].substr(aDirList[0].length - 1,1) === ':'){
        aDirList.splice(0,1);
    };

    return !aDirList.some((item,index)=>{
        return item.substr(0,1) === '_';
    });
};

//检查路径是否为忽略编译的目录
let isIgnoreCompileDir = (sPath)=>{
    let ignoreDir = fws.config.ignoreCompileDir,
        aPathList = path.dirname(sPath).split(path.sep);              

    if(ignoreDir.length){
        return ignoreDir.some((item,index)=>{
            return aPathList.some((_item,_index)=>{
                return item === _item;
            });
        });
    };
    return false;
};

let compile = (filePath)=>{
    let pt = pathInfo(filePath),
        fileType = pt.extension.toLowerCase(),
        fileName = pt.name,
        prefix = fileName ? fileName.substr(0,1) : undefined,
        dist = '',

        //是否为非忽略的目录
        notIgnoreDir = !isIgnoreCompileDir(filePath),

        //设置输出目录
        setDist = (type,extension)=>{
            if(path.dirname(filePath) === fws.srcPath){
                //如果是src根目录下的
                //即项目根目录下的文件，dist就是dev下的根目录
                //例如：dist是dev/*.html
                dist = path.join(fws.devPath,fileName+'.'+extension);
            }else if(filePath.indexOf(inPath[type]) === 0){
                //src/pug目录下的文件
                if(clinked[type] === ''){
                    //当输出关系为根目录时，为避免文件乱串可能会污染到其它地方，输出路径不允许有子目录
                    //例如：dist是dev/*.html
                    dist = path.join(fws.devPath,fileName+'.'+extension);
                }else{
                    //当输出关系不为根目录时，按src/pug结构保留其目录结构
                    //例如：dist是dev/html/*.html
                    dist = filePath.replace(inPath[type],outPath[type]);
                    dist = path.dirname(dist);
                    dist = path.join(dist,fileName+'.'+extension);
                };
            }else{
                //根目录、src/pug以外的其它目录下的文件，保留其结构关系。
                //例如：dist是dev/xxx
                dist = filePath.replace(fws.srcPath,fws.devPath);
                dist = path.dirname(dist);
                dist = path.join(dist,fileName+'.'+extension);
            };
        },

        //检查是否为精灵图目录
        isSpriteDir = (()=>{
            let fileDirName = path.dirname(filePath).split(path.sep),
                re = /^_sprite/i;
                fileDirName = fileDirName[fileDirName.length - 1];
                if(re.test(fileDirName)){
                    return true;
                };
            return false;
        })();

    //如果文件存在，且不在忽略列表的则编译对应的文件
    if(pt.type === 'file'){
        if(fileType === '.pug' && !isFileSlur('pug',filePath) && notIgnoreDir){
            setDist('pug','html');

            let dataPath = path.join(fws.srcPath,'data',fileName+'.js'),
                data = {};
            if(pathInfo(dataPath).extension === '.js'){
                data = fws.require(dataPath);
            };
            pug2html(filePath,dist,data);
        }else if(fileType === '.scss' && !isFileSlur('scss',filePath) && notIgnoreDir){
            setDist('scss','css');
            sass2css(filePath,dist,true);
        }else if(fileType === '.ts' && !isFileSlur('ts',filePath) && notIgnoreDir){
            setDist('ts','js');
            ts2js(filePath,dist);
        }else if(fileType === '.tsx' && !isFileSlur('tsx',filePath) && notIgnoreDir){
            setDist('tsx','jsx');
            ts2js(filePath,dist);
        }else if((fileType === '.png' || fileType === '.svg') && notIgnoreDir && isSpriteDir){

            let dirName = path.dirname(filePath),
                isTimeUp = (()=>{
                    return fws_spriteTime[dirName] !== undefined && new Date().valueOf() - fws_spriteTime[dirName] > 3000
                })();
            
            //初次编译或者距离上一次编译3秒以上才会再次触发精灵图处理
            if(!fws_spriteTime[dirName] || isTimeUp){
                fws_spriteTime[dirName] = new Date().valueOf();

                //编译处理精灵图
                new outSprite(path.dirname(filePath));
            };
            
                        
        }else{
            
            //非data目录的、属于非_起始的目录名均直接拷贝过去
            if(!isDataFile(filePath) && notDir_(filePath)){
                dist = filePath.replace(fws.srcPath,fws.devPath);


                fs.copy(filePath,dist,(err)=>{
                    if(err){
                        tip.error(err);
                    }else{
                        //tip.success(dist+' 同步成功');
                        tip.highlight('同步 ' + dist)
                    };
                });
            };
        };

        
    }else{
        tip.error(filePath+'不是一个有效的文件');
    };
};


module.exports = compile;



