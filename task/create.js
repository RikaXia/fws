'use strict';
const fs = require('fs');
const path = require('path');
const cwdPath = process.cwd();                      //执行命令的当前路径

const fwsPath = path.resolve(__dirname,'../');      //当前工作所在的目录
const tplPath = path.join(fwsPath,'tpl');           //tpl模版目录
const tplConfigPath = path.join(tplPath,'_config'); //模版配置目录
const tip = require('../lib/tip');                  //文字提示
const getType = require('../lib/getType');          //获取数据类型
const isExist = require('../lib/isExist');          //判断文件或目录是否存在

const program = require('commander');               //（https://github.com/tj/commander.js）


class create{
    constructor(name,options){
        const _ts = this;

        _ts.projectName = name;
        _ts.rojectOptions = options;

        _ts.init();
    }

    init(){
        const _ts = this;

        let exec = require('child_process').exec;


        if(name === undefined){
            //如果没有输入项目名则不允许继续操作
            tip.error('项目名称不允许为空');
            return;
        }else{
            //检查项目目录是否已经存在
            let dirIsExist = isExist(name,cwdPath);
            
            //项目已经存在则不创建，反之创建对应的项目
            if(dirIsExist){
                tip.error(`警告："${name}"目录已存在。请更换项目名称或删除原有项目之后重试。`);
            }else{
                createInit(name,'pc')
            };
        };


        // exec('rm demo -rf',(err,out)=>{
        //     if(err){
        //         tip.error(err);
        //     }else{
                
        //     };
        // });
    }

    createFn(projectPath,tplConfig){
        const _ts = this;

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
    }


    star(name,type){
        const _ts = this;

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
            _ts.createFn(projectPath,configData);
        };
    }
}



module.exports = {
    regTask:{
        command:'[name]',
        description:'初始化一个项目',
        option:[
            ['-p, --pc','初始化一个pc项目'],
            ['-m, --mobile','初始化一个移动端项目']
        ],
        help:()=>{
            //额外的帮助
        },
        action:init
    },
    fun:()=>{}
};




// /**
//  * 
//  * @param {string} projectPath 项目名称
//  * @param {object} tplConfig 项目的依赖关系和文件结构Json对象
//  */
// let createFn = (projectPath,tplConfig)=>{

//     //遍历对象，开始创建文件和目录
//     let eachCreate,
//         starTime = new Date().valueOf();

//     (eachCreate = (o,p)=>{
//         for(let i in o){
            
//             let currentPath = path.join(p);                                 //得到当前路径

//             if(i === "__files__"){
//                 /**创建文件开始 */

//                 let queue = o[i];                                           //创建队列

//                 queue.forEach((item,index)=>{
//                     let _src = path.join(tplPath,item[0]);                  //母板
//                     let _target = path.join(currentPath,item[1]);           //目标

//                     fs.stat(_src,(err,file)=>{
//                         if(err){
//                             tip.error(err);
//                         }else if(file.isFile()){
                            
//                             let readAble = fs.createReadStream(_src),       //创建读取流
//                                 writAble = fs.createWriteStream(_target);   //创建写入流
                            
//                             readAble.pipe(writAble);                        //通过管道来传输

//                             tip.success(`创建文件 ${_target}`);
//                             tip.gray(`用时：${new Date().valueOf() - starTime} ms`);
//                         };
//                     });
//                 });
//             }else{
//                 currentPath = path.join(currentPath,i);                     //设置当前路径为新的目录
//                 fs.mkdirSync(path.join(currentPath));                       //创建目录
//                 tip.success(`创建目录 ${path.join(currentPath)}`);;
//                 tip.gray(`用时：${new Date().valueOf() - starTime} ms`);
                
//                 if(getType(o[i]) === 'json'){
//                      eachCreate(o[i],currentPath);                          //如果是目录则无限级循环
//                 };
//             };
//         };
//     })(tplConfig,projectPath);
// };




// /**
//  * 创建指定类型的项目
//  * @param {string} name 项目文件夹名称
//  * @param {string} type 项目类型
//  */
// let createInit = (name,type)=>{
//     let configPath = path.join(tplConfigPath,type+'.json'),
//         configData;
    

//     try {
//         //let configFile = fs.statSync(configPath);
//         //if(configFile.isFile()){

//         let configContent = fs.readFileSync(configPath).toString();

//         configData = JSON.parse(configContent);


//         //};
//     } catch (err) {
//         tip.error(err);
//         tip.error(`请检查对应的模版配置文件是否存在`);
//     };


//     //如果有获取到配置文件，则开始创建项目
//     if(configData){
//         let projectPath = path.join(cwdPath,name);


//         //创建项目目录
//         fs.mkdirSync(projectPath);

//         //根据配置文件创建文件
//         createFn(projectPath,configData);
//     };
// };

// let init = (name,options)=>{
//     let exec = require('child_process').exec;

//     console.log(options);

//     if(name === undefined){
//         //如果没有输入项目名则不允许继续操作
//         tip.error('项目名称不允许为空');
//         return;
//     }else{
//         //检查项目目录是否已经存在
//         let dirIsExist = isExist(name,cwdPath);
        
//         //项目已经存在则不创建，反之创建对应的项目
//         if(dirIsExist){
//             tip.error(`警告："${name}"目录已存在。请更换项目名称或删除原有项目之后重试。`);
//         }else{
//             createInit(name,'pc')
//         };
//     };


//     // exec('rm demo -rf',(err,out)=>{
//     //     if(err){
//     //         tip.error(err);
//     //     }else{
            
//     //     };
//     // });
// };
