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

        let es2 = require('../lib/es2');

        new es2({
            src:m.path.join(fws.srcPath,'js','app.tsx'),
            dist:m.path.join(fws.srcPath,'js','appBuild.js'),
            debug:true
        }).then(v => {
            //console.log(v);
        }).catch(e => {
            //console.log(e);
        });
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