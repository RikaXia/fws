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

        var postcss = require('postcss');
        var cssnano = require('cssnano');
        var autoprefixer = require('autoprefixer');
        var sign = require('../lib/signature');
        var htmlSign = sign('.js');

        var file = m.path.join(fws.srcPath,'test.css');
        var css = m.fs.readFileSync(file).toString();

        var prefixer = postcss([ autoprefixer ]);
        
        postcss([cssnano,autoprefixer({ add: true, browsers: [] })]).process(css)
        .then(result => {
            return prefixer.process(result.css)
            // fs.writeFile('dest/app.css', result.css);
            // if ( result.map ) fs.writeFile('dest/app.css.map', result.map);
        }).then(result => {
            console.log(result)
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