const getType = require('../lib/getType');
//const isExist = require('../lib/isExist');

class compile{
    constructor(obj){
        const _ts = this;

        //_ts.path = projectPath || fs.cmdPath;
        
        _ts.config = {
            'entr':'',
            'out':'',
            'compact':false
        };

        //重置默认参数
        if(obj && getType(obj) === 'object'){
            for(let i in obj){
                _ts.config[i] = obj[i];
            };
        };

        _ts.init();
    }

    init(){
        const _ts = this;

        _ts.getFileType();

    }



};

new compile({
    'entr':'C:\Users\sbfkcel\Desktop\temp\demo\src\sass\style.scss',
    'out':'C:\Users\sbfkcel\Desktop\temp\demo\dev\css\style.css',
    'compact':true
})


module.exports = {
    regTask:{
        command:'[name]',
        description:'监听编译，该任务会自动检测Typescript、pug、scss的文件修改变化实时编译对应文件',
        // option:[
        //     ['-p, --pc','初始化一个pc项目'],
        //     ['-m, --mobile','初始化一个移动端项目']
        // ],
        help:()=>{
            //额外的帮助
        },
        action:compile
    }
};