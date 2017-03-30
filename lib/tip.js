'use strict';

const colors = require('colors');         //文档见（https://www.npmjs.com/package/colors）

//定义日志输出样式
colors.setTheme({
    success:['green','bold'],
    warn:['yellow','bold'],
    error:['red','bold'],
    gray:['gray'],
    highlight:['yellow','italic']
});

//向外提供输出方法
module.exports = {
    error:(text)=>{
        console.log(text.error);
    },
    warn:(text)=>{
        console.log(text.warn);
    },
    success:(text)=>{
        console.log(text.success);
    },
    gray:(text)=>{
        console.log(text.gray);
    },
    highlight:(text)=>{
        console.log(text.highlight);
    }
}