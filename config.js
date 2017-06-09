//该配置会被项目目录下'fws_config.js'同键值所取代

module.exports = {  
    //作者名称
    author:'单炒饭222',
    
    //作者邮箱
    mail:'liyong2222@4399.com',
    
    // //项目名称
    // projectName:'',

    // //更新者信息
    // author_update:'',
    // mail_update:'',

    //图像合并处理引擎，推荐('canvassmith')
    //由于安装门槛，请在全局或fws成功安装'canvassmith'再启用，否则可能导致出错
    imgEngine:'',

    listenPort:3000,
    
    //模版路径
    tplPath:'',
    
    //字体路径
    ttfPath:'',

    //ignore的编译目录，只作拷贝
    ignoreCompileDir:['node_modules'],

    //资源匹配替换
    srcReplace:[
        ["localFile","cdnFilePath"]
    ],
    
    //源文件目录同步路径
    srcSync:{
        path:'',
        fileType:'*.*'
    },

    //编译目录同步路径
    devSync:{
        path:'',
        fileType:'*.*'
    },

    //发布目录同步路径
    distSync:{
        path:'',
        fileType:'*.*'
    }

};