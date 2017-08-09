class Test{
    constructor(){
        const _ts = this;
        _ts.m = {
            path:require('path'),
            fs:require('fs-extra')
        };
    }

    init(){
        const _ts = this,
            m = _ts.m,
            api = require('../api'),
            tip = require('../lib/tip');
        
        
        new api.Pug2html({
            src:m.path.join(fws.srcPath,'index.pug'),
            dist:m.path.join(fws.devPath,'index.html'),
            debug:false
        }).then(v => {
            tip.success(v.msg);
            console.log(v);
        }).catch(e => {
            tip.error('编译出错，详情：');
            console.log(e);
        });
        

    }
}

module.exports = {
    regTask:{
        command:'[name]',
        description:'测试用例',
        option:[
        ],
        help:()=>{
        },
        action:Test
    },
    fun:()=>{}
};