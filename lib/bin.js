#!/usr/bin/env node
'use strict';

//const parameter = process.argv.splice(2);           //传入的参数
const fs = require('fs');
const path = require('path');
const cwdPath = process.cwd();                      //当前路径
const program = require('commander');               //（https://github.com/tj/commander.js）

const tip = require('./tip');                       //文字提示



//声明版本号
program.version('0.0.1');
//program.options[0].description = '输出版本号';


//创建空项目
program
    .command('create [name]')
    .description('创建一个新项目')
    .option('-p, --pc','创建一个新的pc项目')
    .option('-m, --mobile','创建一个新的移动端项目')
    .action((name,options)=>{
        if(name === undefined){
            //如果没有输入项目名则不允许继续操作
            tip.error('项目名称不允许为空');
            return;
        }else{

            //获取路径下所有目录
            let dirList = fs.readdirSync(cwdPath);

            //遍历是否有对应的目录
            let dirIsExist = dirList.some((item,index)=>{
                return item === name;
            });

            //项目已经存在则不创建，反之创建对应的项目
            if(dirIsExist){
                tip.error('当前路径下已经存在该项目目录，请删除后再操作！');
            }else{
                if(options.pc){

                }else if(option.mobile){

                };
            };

            //array.every、array.some


        };

        
        
        //console.log(name,cwdPath);

        
    });


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

