'use strict';
const fs = require('fs');
const path = require('path');
const cwdPath = process.cwd();                      //当前路径



let createDir = (projectPath)=>{
    let initFiles = {
        "pug":[
            ["index--pc.pug","index.pug"]
        ],
        "data":[
            ["_public.js"],
            ["index.js"]
        ],
        "sass":[
            ["_reset.scss"],
            ["_mixin.scss"],
            ["style.scss"]
        ],
        "ts":[
            ["main.ts"]
        ],
        "media":[
            [".fwskeep"]
        ],
        "images":[
            [".fwskeep"]
        ]

    };


    dirName.forEach((item,index)=>{
        fs.mkdirSync(path.join(projectPath,item));
    });
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