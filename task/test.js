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
        
        console.log(fws);
        

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