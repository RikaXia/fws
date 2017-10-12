# 自定义任务

```javascript
class Test{
    constructor(name,options){
        const _ts = this;

        //自定义模块
        _ts.m = {
            path:require('path'),
            fs:require('fs-extra')
        };

        _ts.name = name;
        _ts.option = options;
    }

    init(){
        const _ts = this;

        console.log(_ts.name,_ts.option.param);

        console.log('============================')
        console.log(fws);
        

    }
}

module.exports = {
    regTask:{
        command:'[name]',
        description:'这是一个测试任务。（任务描述）',
        option:[
            //['-p, --param [type]','任务参数（可选）']
            ['-p, --param <type>','任务参数（必选）']
        ],
        help:()=>{
            console.log('');
            console.log('   补充说明:');
            console.log('   ------------------------------------------------------------');
            console.log('   暂无');
        },
        action:Test
    },
    fun:()=>{}
};
```