#!/usr/bin/env node
'use strict';

//const parameter = process.argv.splice(2);           //传入的参数
const fs = require('fs');
const path = require('path');
const cwdPath = process.cwd();                      //当前路径
const program = require('commander');               //（https://github.com/tj/commander.js）

const tip = require('./lib/tip');                   //文字提示
const pathInfo = require('./lib/getPathInfo');      //获取目标路径的相关信息
const getType = require('./lib/getType');           //获取数据类型

const fwsConfig = require('./config');

//声明版本号
program.version('0.0.1');
//program.options[0].description = '输出版本号';


//定义全局
global.fws = {    
    'fwsPath':__dirname,                                    //fws目录路径
    'taskPath':path.join(__dirname,'/task'),                //任务插件路径
    'tplPath':path.join(__dirname,'/tpl'),                  //内置tpl目录
    'tplConfigPath':path.join(__dirname,'/tpl/_config'),    //内置tpl配置目录    
    'cmdPath':cwdPath,                                      //当前进程所在的目录
    'srcPath':path.join(cwdPath,'/src'),                    //当前进程下的src目录
    'devPath':path.join(cwdPath,'/dev'),                    //当前进程下的dev目录
    'distPath':path.join(cwdPath,'/dist'),                  //当前进程下的dist目录
    'config':fwsConfig,
    'require':(module)=>{                                   //引入模块并且不缓存
        delete require.cache[require.resolve(module)];
        return require(module);
    }
};

//检查任务目录是否存在,如果有则注册所有任务
if(pathInfo(path.join(__dirname,'/task')).type === 'dir'){
    let taskList = fs.readdirSync(fws.taskPath),
        task = {};
    
    for(let index=0,len = taskList.length; index<len; index++){
        let item = taskList[index],
            
            taskFile = path.join(fws.taskPath,item),
            extName = path.extname(taskFile),           //得到文件扩展名，这里为“.json”
            fileName = path.basename(taskFile,extName), //得到文件名,不包括扩展名部分的
            taskContent = require(taskFile).regTask;    //得到任务注册相关参数
        
        //检查是否有注册任务
        if(taskContent){

            //任务主参数接收
            if(taskContent.command && getType(taskContent.command) === 'string'){
                task[fileName] = program.command(`${fileName} ${taskContent.command}`);
            }else{
                tip.error(`任务 "${taskFile}" regTask.command 无效`);
                continue;
            };            
        
            //任务描述添加
            if(taskContent.description && getType(taskContent.description) === 'string'){
                task[fileName].description(taskContent.description);
            };      

            //任务参数绑定
            // function list(val) {
            //     return val.split(',');
            // }
            // task[fileName].option('-l, --list <items>', 'IP列表', list);

            // console.log(task[fileName]);

            if(taskContent.option && getType(taskContent.option) === 'array'){
                taskContent.option.forEach((item,index)=>{
                    task[fileName].option.apply(task[fileName],item);               
                    //task[fileName].option(item[0],item[1],item[2]);
                });
            };
            
            
            //任务方法绑定
            if(taskContent.action && getType(taskContent.action) === 'function'){

                task[fileName].action((name,options)=>{
                    try {
                        new taskContent.action(name,options);
                    } catch (error) {
                        taskContent.action(name,options);
                    };                 
                });
            }else{
                tip.error(`任务 "${taskFile}" regTask.action 必须是一个函数`);
            };

            //任务帮助说明处理
            if(taskContent.help && getType(taskContent.help) === 'function'){
                task[fileName].on('--help',(...arg)=>{
                    taskContent.help(arg);
                });
            };

            

        }else{
            tip.error(`"${taskFile}" 不是一个有效的任务插件，请检查插件暴露参数。`);
        };
        
    };

}else{
    tip.error(`任务目录 ${fws.taskPath}  好像不存在，请检查……`);
};


//添加额外的帮助信息
program.on('--help',()=>{
    console.log(`  Examples:`);
    console.log(``);

    //tip.highlight(`     fws -h       查看帮助`);
    tip.highlight(`     Author by 单炒饭`);
});

//解析命令行参数argv
program.parse(process.argv);

//当没有传入参数时，输出帮助信息
if (!process.argv.splice(2).length) {
    program.outputHelp();
};
