const getType = require('../lib/getType');
const tip = require('../lib/tip');


let fun = (name,options)=>{
    // console.log(name);
    // console.log(name,options);

    console.log(options.list,typeof options.list)
};

function range(val) {
  return val.split('..').map(Number);
};

function list(val) {
    return val.split(',');
}
module.exports = {
    regTask:{
        command:'[name]',
        description:'Task测试样本',
        option:[
            ['-r, --range <a>..<b>', '阈值区间', range],
            ['-l, --list <items>','一个列表',list]
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