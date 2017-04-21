const getType = require('../lib/getType');
const tip = require('../lib/tip');


let fun = (name)=>{
    console.log(fws);
};
module.exports = {
    regTask:{
        command:'[name]',
        description:'创建一个新的空项目',
        option:[
            ['-p, --pc','初始化一个pc项目'],
            ['-m, --mobile','初始化一个移动端项目']
        ],
        help:()=>{
            console.log(`  Examples:`);
            console.log(``);

            tip.highlight(`     fws testTask -h       查看帮助`);
            tip.highlight(`     自定义项目模版见`);
        },
        action:fun
    },
    fun:()=>{}
};