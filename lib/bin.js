#!/usr/bin/env node
'use strict';

//const parameter = process.argv.splice(2);           //传入的参数
const fs = require('fs');
const path = require('path');
const cwdPath = process.cwd();                      //当前路径
const program = require('commander');               //（https://github.com/tj/commander.js）

const tip = require('./tip');                       //文字提示
const isExist = require('./isExist');               //判断文件或目录是否存在
const createProject = require('./createProject');   //项目创建


//声明版本号
program.version('0.0.1');
//program.options[0].description = '输出版本号';


//创建空项目
program
    .command('create [name]')
    .description('创建一个新项目')
    .option('-p, --pc','创建一个新的pc项目')
    .option('-m, --mobile','创建一个新的移动端项目')
    // .option('-rp, --react_pc','创建一个新的react pc项目')
    // .option('-rm, --react_mobile','创建一个新的react移动端项目')
    // .option('-vp, --vue_pc','创建一个新的vue pc项目')
    // .option('-vm, --vue_mobile','创建一个新的vue移动端项目')
    // .option('-g2, --game2d','创建一个2d h5游戏项目（Laya引擎）')
    // .option('-g3, --game3d','创建一个3d h5游戏项目（Laya引擎）')
    .action((name,options)=>{
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
                if(options.pc){
                    //pc项目
                    createProject(name,'pc');
                }else if(options.mobile){
                    //移动端项目
                    createProject(name,'mobile');
                }else if(options.game2d){
                    //html5游戏2d项目
                    createProject(name,'game2d');
                }else if(options.game3d){
                    //html5游戏3d项目
                    createProject(name,'game3d');
                }else{
                    tip.error('警告：您未传入有效的项目类型。');
                };
            };

            //array.every、array.some
        };
    });

//


//初始化项目（会启动监听任务）
program
    .command('init')
    .description('初始化一个项目')
    .option('-p, --pc','初始化一个pc项目')
    .option('-m, --mobile','初始化一个移动端项目')
    .action((a)=>{
        console.log(a)
    });


//监听项目
program
    .command('watch <string>')
    .description('监听项目文件，自动编译')
    .action(()=>{

    });


//添加额外的帮助信息
program.on('--help',()=>{
    console.log('  Examples:');
    console.log('');

    tip.gray('    # 初始化一个pc项目');
    console.log('    $ fws init --pc');
    console.log('');

    tip.gray('    # 创建一个pc项目');
    console.log('    $ fws create --pc');
    console.log('');

    tip.highlight('    by 单炒饭 (gz0119)');
});

//解析命令行参数argv
program.parse(process.argv);

//当没有传入参数时，输出帮助信息
if (!process.argv.splice(2).length) {
    program.outputHelp();
};

