'use strict';
const fs = require('fs');
const path = require('path');
const cwdPath = process.cwd();                      //执行命令的当前路径

const fwsPath = path.resolve(__dirname,'../');      //当前工作所在的目录
const tplPath = path.join(fwsPath,'tpl');           //tpl模版目录

let createDir = (projectPath)=>{
    let initFiles = {
        "pug":{
            "_pug":"",                              //额外的目录
            "__files__":[
                ["pug/index.pug","index.pug"]       //[0]为母版，[1]为新的文件名
            ]
        },
        "data":{
            "__files__":[
                ["data/_public.js","_public.js"],
                ["data/_index.js","index.js"]
            ]
        },
        "sass":{
            "__files__":[
                ["data/_reset.scss","_reset.scss"],
                ["data/_mixin.scss","_mixin.scss"],
                ["data/style.scss","style.scss"]
            ]
        },
        "ts":{
            "__files__":[
                ["ts/main.ts","main.ts"]
            ]
        },
        "media":{},
        "images":{},
        "__files__":[
            ["pug/index.pug","index.pug"]
        ]
    };

    //遍历对象，开始创建文件和目录
    let eachCreate;
    (eachCreate = (obj,projectPath)=>{
        
        for(let i in obj){

            if(i === '__files__'){
                let aFileList = initFiles[i];

                aFileList.forEach((e,i)=>{
                    //读取模版文件
                    let file = fs.readFileSync(path.join(tplPath,'pug','index.pug'));

                    //写入文件到目标目录
                    fs.writeFileSync()
                });

            }else{
                //创建目录
                fs.mkdirSync(path.join(projectPath,i));
            };
        };
    })(initFiles,projectPath);
    


    // dirName.forEach((item,index)=>{
    //     fs.mkdirSync(path.join(projectPath,item));
    // });
};




/**
 * 创建一个空的项目
 * @param {string} name 项目文件夹名称
 * @param {string} type 项目类型
 */
let fun = (name,type)=>{
    switch (type) {
        case 'pc':
            let projectPath = path.join(cwdPath,name);

            //开始创建项目目录
            fs.mkdirSync(projectPath);
            createDir(projectPath);
            
        break;

        case 'mobile':

        break;

        case 'game2d':
        
        break;

        case 'game3d':

        break;
    
        default:
        break;
    }
}; 

module.exports = fun;