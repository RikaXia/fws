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
        
        
        new api.OutSprite({
            srcDir:m.path.join(fws.srcPath,'images','_spriteImg'),
            distSpreiteDir:m.path.join(fws.srcPath,'images'),
            distScssDir:m.path.join(fws.srcPath,'images')
        }).then(v => {
            tip.success(v.msg);
            //console.log(v);
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