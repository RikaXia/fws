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
                

                if(path.dirname(filePath).indexOf(inPath.pug) === 0){
                    dist = filePath.replace(inPath.pug,outPath.pug);
                    dist = path.dirname(dist);
                    dist = path.join(dist,fileName+'.html');
                    

                    console.log('最终：',dist);
                    //console.log('文件目录与输入目录一致：',filePath)
                }else{
                    //console.log('反之：',filePath);
                    console.log('最终：');
                };

                console.log('=======================================================================');



                

                // //如果是有指定输出规则的，按照输出规则输出，否则dev与src目录结构对应输出
                // if(path.dirname(filePath) === inPath.pug){
                //     //为防止文件乱串,设定输出目录在dev根目录下的不再进行子目录输出都统一在dev根目录下
                //    dist = path.join(outPath.pug,fileName+'.html');
                //     // console.log('文件',filePath);
                //     // console.log('输入',inPath.pug);
                //     // console.log('输出',outPath.pug);
                // }else{
                //     //将输入目录替换成输出目录
                //         console.log('文件',filePath,'in',inPath.pug,'out',outPath.pug);
                //         dist = filePath.replace(inPath.pug,outPath.pug);

                //         //去除原始文件名
                //         dist = path.dirname(dist);

                //         //赋予新的文件名
                //         dist = path.join(dist,fileName+'.html');
                //     console.log(3);
                // };

                // console.log(filePath);
                // console.log(dist);

                //获取数据
                let dataPath = path.join(fws.srcPath,'data',fileName+'.js'),
                    data = {};
                
                //对应的数据文件存在,则引入数据
                if(pathInfo(dataPath).extension === '.js'){
                    data = fws.require(dataPath);
                };

                //编译
                //console.log(dist);
                //pug2html(filePath,dist,data);
            break;

            case '.scss':

            break;
        };
    }else if(pt.type === undefined){
        tip.error(filePath+'不是一个有效的文件');
    };
};


module.exports = compile;



