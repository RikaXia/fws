'use strict';
const fs = require('fs');
const path = require('path');
const cwdPath = process.cwd();                      //执行命令的当前路径

const fwsPath = path.resolve(__dirname,'../');      //当前工作所在的目录
const tplPath = path.join(fwsPath,'tpl');           //tpl模版目录
const tplConfigPath = path.join(tplPath,'_config'); //模版配置目录
const tip = require('../lib/tip');                  //文字提示
const getType = require('../lib/getType');          //获取数据类型

const program = require('commander');               //（https://github.com/tj/commander.js）


//读取模版目录模块配置文件并解析成数据

// let configList = fs.readdirSync(tplConfigPath);     //得到所有配置文件

// let config = {};                                    //声明一个临时对象，用于存放路径

// configList.forEach((item,index)=>{
//     let filePath = path.join(tplConfigPath,item);

//     let extName = path.extname(filePath),           //得到文件扩展名，这里为“.json”
//         fileName = path.basename(filePath,extName); //得到文件名,不包括扩展名部分的
    
//     let fileContent = fs.readFileSync(filePath).toString();
    
//     config[fileName] = JSON.parse(fileContent);     //将得到文件以
// });

let createDir = (projectPath,tplConfig)=>{
    // let initFiles = {
    //     "pug":{
    //         "_pug":"",                              //额外的目录
    //         "__files__":[
    //             ["pug/index.pug","index.pug"]       //[0]为母版，[1]为新的文件名
    //         ]
    //     },
    //     "data":{
    //         "__files__":[
    //             ["data/_public.js","_public.js"],
    //             ["data/index.js","index.js"]
    //         ]
    //     },
    //     "sass":{
    //         "__files__":[
    //             ["scss/_reset.scss","_reset.scss"],
    //             ["scss/_mixin.scss","_mixin.scss"],
    //             ["scss/style.scss","style.scss"]
    //         ]
    //     },
    //     "ts":{
    //         "__files__":[
    //             ["ts/main.ts","main.ts"]
    //         ]
    //     },
    //     "media":{},
    //     "images":{},
    //     "__files__":[
    //         ["pug/index.pug","index.pug"]
    //     ]
    // };

    //遍历对象，开始创建文件和目录
    let eachCreate,
        starTime = new Date().valueOf();

    (eachCreate = (o,p)=>{
        for(let i in o){
            
            let currentPath = path.join(p);                                 //得到当前路径

            if(i === "__files__"){
                /**创建文件开始 */

                let queue = o[i];                                           //创建队列

                queue.forEach((item,index)=>{
                    let _src = path.join(tplPath,item[0]);                  //母板
                    let _target = path.join(currentPath,item[1]);           //目标

                    fs.stat(_src,(err,file)=>{
                        if(err){
                            tip.error(err);
                        }else if(file.isFile()){
                            
                            let readAble = fs.createReadStream(_src),       //创建读取流
                                writAble = fs.createWriteStream(_target);   //创建写入流
                            
                            readAble.pipe(writAble);                        //通过管道来传输

                            tip.success(`创建文件 ${_target}`);
                            tip.gray(`用时：${new Date().valueOf() - starTime} ms`);
                        };
                    });
                });
            }else{
                currentPath = path.join(currentPath,i);                     //设置当前路径为新的目录
                fs.mkdirSync(path.join(currentPath));                       //创建目录
                tip.success(`创建目录 ${path.join(currentPath)}`);;
                tip.gray(`用时：${new Date().valueOf() - starTime} ms`);
                
                if(getType(o[i]) === 'json'){
                     eachCreate(o[i],currentPath);                          //如果是目录则无限级循环
                };
            };
        };
    })(tplConfig,projectPath);
};




/**
 * 创建一个空的项目
 * @param {string} name 项目文件夹名称
 * @param {string} type 项目类型
 */
let fun = (name,type)=>{
    
    let configPath = path.join(tplConfigPath,type+'.json'),
        configData;
    

    try {
        //let configFile = fs.statSync(configPath);
        //if(configFile.isFile()){

        let configContent = fs.readFileSync(configPath).toString();

        configData = JSON.parse(configContent);


        //};
    } catch (err) {
        tip.error(err);
        tip.error(`请检查对应的模版配置文件是否存在`);
    };


    //如果有获取到配置文件，则开始创建项目
    if(configData){
        let projectPath = path.join(cwdPath,name);


        //创建项目目录
        fs.mkdirSync(projectPath);

        //根据配置文件创建文件
        createDir(projectPath,configData);
    };

    //console.log(configFile)


    


    // switch (type) {
    //     case 'pc':
    //         let projectPath = path.join(cwdPath,name);

    //         //开始创建项目目录
    //         fs.mkdirSync(projectPath);
    //         createDir(projectPath);
            
    //     break;

    //     case 'mobile':

    //     break;

    //     case 'game2d':
        
    //     break;

    //     case 'game3d':

    //     break;
    
    //     default:
    //     break;
    // }
}; 

module.exports = {
    regTask:{
        command:'init [name]',
        description:'初始化一个项目',
        option:[
            ['-p, --pc','初始化一个pc项目'],
            ['-m, --mobile','初始化一个移动端项目']
        ],
        help:()=>{
            //额外的帮助
        },
        action:fun
    },
    fun:fun
};