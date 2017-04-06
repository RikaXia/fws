//该配置会被项目目录下'fws_config.js'同键值所取代

module.exports = {  
    //作者名称
    author:'name',
    
    //作者邮箱
    mail:'name@4399.com',

    //自动刷新
    autoRefresh:true,
    
    //模版路径
    tplPath:'',
    
    //字体路径
    ttfPath:'',
    
    //源文件目录同步路径
    srcSync:{
        path:'',
        fileType:'*'
    },

    //编译目录同步路径
    devSync:{
        path:'',
        fileType:'*'
    },

    //发布目录同步路径
    distSync:{
        path:'',
        fileType:'*'
    }

};