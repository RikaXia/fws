module.exports = {
    regTask:{
        command:'[name]',
        description:'初始化一个项目',
        option:[
            ['-p, --pc','初始化一个pc项目'],
            ['-m, --mobile','初始化一个移动端项目']
        ],
        help:()=>{
            //额外的帮助
        },
        action:()=>{}
    },
    fun:()=>{}
};