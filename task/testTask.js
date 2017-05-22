class Test{
    constructor(){
        const _ts = this;
        _ts.m = {
            //path:require('path'),
            openurl:require('openurl'),
            //getType:require('../lib/getType'),
            //tip:require('../lib/tip'),
            //outSprite:require('../lib/outSprite'),
            autoRefresh:require('../lib/autoRefresh')
        };
        _ts.init();
    }

    init(){
        const _ts = this;
        new _ts.m.autoRefresh();

        _ts.m.openurl.open('http://web.4399.com')

    }
}

function range(val) {
  return val.split('..').map(Number);
};

function list(val) {
    return val.split(',');
};

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
        action:Test
    },
    fun:()=>{}
};