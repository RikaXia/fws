class Build{
    constructor(srcPath,options){
        const _ts = this;

        let m = _ts.m = {
            fs:require('fs-extra'),
            path:require('path'),
            tip:require('../lib/tip'),
            pathInfo:require('../lib/getPathInfo')
        };
    }

    //初始化
    init(){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;

        let CompileJs = require('../lib/compile_js');

        new CompileJs({
            src:m.path.join(fws.devPath,'js','es6','app.js'),
            dist:m.path.join(fws.devPath,'js','es6','app.min.js')
        }).then(v => {
            console.log(v);
        }).catch(e => {
            console.log(e); 
        });

        // 测试编译到JS的文件

        // let es2 = require('../lib/es2');

        // new es2({
        //     src:m.path.join(fws.srcPath,'js','ts','m1.ts'),
        //     dist:m.path.join(fws.srcPath,'js','ts','appBuild.js'),
        //     debug:false
        // }).then(v => {
        //     console.log('正确',v.msg);
        // }).catch(e => {
        //     console.log('错误',e.msg);
        // });
    }
};


module.exports = {
    regTask:{
        command:'[name]',
        description:'编译项目',
        option:[
            ['-s, --server','开启http server']
        ],
        help:()=>{
            console.log('   补充说明:');
            console.log('   ------------------------------------------------------------');
            console.log('   暂无');
        },
        action:Build
    }
};