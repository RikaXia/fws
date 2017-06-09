'use strict';
const chalk = require('chalk');

module.exports = {
    error:(...arg)=>{
        arg.unshift('✖︎');
        console.log(chalk.red.apply(null,arg));
    },
    warn:(...arg)=>{
        arg.unshift('☛');
        console.log(chalk.magenta.apply(null,arg));
    },
    success:(...arg)=>{
        arg.unshift('✔︎');
        console.log(chalk.green.apply(null,arg));
    },
    gray:(...arg)=>{
        console.log(chalk.gray.apply(null,arg));
    },
    highlight:(...arg)=>{
        console.log(chalk.yellow.apply(null,arg));
    }
}