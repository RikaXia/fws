'use strict';
const fs = require('fs');
const path = require('path');

const pathInfo = require('./getPathInfo');
const tip = require('./tip');
const sass2css = require('./sass2css');        //sass编译css
const pug2html = require('./pug2html');        //pug编译html
const ts2js = require('./ts2js');              //typescript编译js


//设置文件编译的对应关系
let clinked = {
    'pug':'',
    'sass':'css',
    'ts':'js',
    'tsx':'jsx'
};

//忽略的目录
let slurDir = [];
//slurDir.push('data');                               //默认所data目录过滤掉，该目录只作为pug的编译数据，不作同步拷贝操作

//先检查src目录是否存在，如果存在则根据编译关系过滤得到要忽略的目录名
if(pathInfo(fws.srcPath).type === 'dir'){
    //用于保存src下的所有目录
    let srcDirPath = [];

    //获取项目src目录下所有文件列表并取出子目录的路径
    let srcAllList = fs.readdirSync(fws.srcPath);
    srcAllList.forEach((item,index)=>{
        srcDirPath.push(item);
    });

    //指定的目录名在src目录下是否存在
    let isMatch = (name)=>{
        return srcDirPath.some((item,index)=>{
            return name === item;
        });
    };

    //根据编译对应关系得到要忽略的目录名
    for(let i in clinked){
        if(isMatch(i)){
            slurDir.push(clinked[i]);
        };
    };
};

//处理成为最终的目录路径
slurDir.forEach((item,index)=>{
    slurDir[index] = path.join(fws.srcPath,item);
});

//
let inPath = {},
    outPath = {};

for(let i in clinked){
    inPath[i] = path.join(fws.srcPath,i);
    outPath[i] = path.join(fws.devPath,clinked[i]);
};

/**
 * 文件路径是否属于要忽略的文件
 * 
 * @param {string} sPath 
 */
let isSlur = (sPath)=>{
    sPath = path.dirname(sPath);
    return slurDir.some((item,index)=>{
        return sPath === item;
    });
};

console.log('忽略的目录：',slurDir);
console.log('检查忽略：',isSlur(path.join(fws.srcPath,'','index.pug')));

let compile = (filePath)=>{
    let pt = pathInfo(filePath),
        fileType = pt.extension,
        fileName = pt.name,
        dist = '';
    //如果文件存在，且不在忽略列表的则编译对应的文件
    if(pt.type === 'file' && !isSlur(filePath)){
        switch (fileType) {
            case '.pug':
                console.log('文件：',filePath);
                console.log('inPath：',inPath.pug);
                console.log('outPath：',outPath.pug);

                
                if(path.dirname(filePath) === fws.srcPath){
                    //如果是src根目录下的
                    //即项目根目录下的文件，dist就是dev下的根目录
                    //例如：dist是dev/*.html
                    dist = path.join(fws.devPath,fileName+'.html');
                }else if(filePath.indexOf(inPath.pug) === 0){
                    //src/pug目录下的文件
                    if(clinked.pug === ''){
                        //当输出关系为根目录时，为避免文件乱串可能会污染到其它地方，输出路径不允许有子目录
                        //例如：dist是dev/*.html
                        dist = path.join(fws.devPath,fileName+'.html');
                    }else{
                        //当输出关系不为根目录时，按src/pug结构保留其目录结构
                        //例如：dist是dev/html/*.html
                        dist = filePath.replace(inPath.pug,outPath.pug);
                        dist = path.dirname(dist);
                        dist = path.join(dist,fileName+'.html');
                    };
                }else{
                    //根目录、src/pug以外的其它目录下的文件，保留其结构关系。
                    //例如：dist是dev/xxx
                    dist = filePath.replace(fws.srcPath,fws.devPath);
                    dist = path.dirname(dist);
                    dist = path.join(dist,fileName+'.html');
                };

                //获取数据
                let dataPath = path.join(fws.srcPath,'data',fileName+'.js'),
                    data = {};
                
                //对应的数据文件存在,则引入数据
                if(pathInfo(dataPath).extension === '.js'){
                    data = fws.require(dataPath);
                };
                pug2html(filePath,dist,data);
            break;

            case '.scss':
                

            break;
        };
    }else if(pt.type === undefined){
        tip.error(filePath+'不是一个有效的文件');
    };
};


module.exports = compile;



