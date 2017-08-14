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
            srcDir:m.path.join(fws.srcPath,'images','_spritexxx'),
            distSpreiteDir:m.path.join(fws.srcPath,'images'),
            distScssDir:m.path.join(fws.srcPath,'css')
        }).then(v => {
            for(let i of v){
                tip.success(i.msg);
            };
            //console.log(v);
            // tip.success(v.msg);
            //console.log(v);
        }).catch(e => {
            tip.error(e.msg);
            console.log(e.info);
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