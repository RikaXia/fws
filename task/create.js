'use strict';
const fs = require('fs');
const path = require('path');

const program = require('commander');               //（https://github.com/tj/commander.js）

const tip = require('../lib/tip');                  //文字提示
const getType = require('../lib/getType');          //获取数据类型
const pathInfo = require('../lib/getPathInfo');     //获取目标路径的相关信息


let aConfigDirList = fs.readdirSync(fws.tplConfigPath),//获取配置目录所有文件列表
    aConfigList = [],
    re = /^(\w*)(.json)$/i;

aConfigDirList.forEach((item,index)=>{
    if(re.test(item)){
        aConfigList.push(item.substr(0,item.length - 5));
    };
});

class create{
    constructor(name,options){
        const _ts = this;

        //将命令传入的名称，和参数绑定到对象之上
        _ts.projectName = name;
        _ts.rojectOptions = options;
        _ts.templateName = (getType(options.template) === 'string') ? options.template  : 'pc';

        _ts.init();
    }

    /**
     * 初始化方法，会检查项目目录是否已经存在，存在则不创建
     * 如果获取不到指定类型的配置文件中断创建过程
     * 
     * @returns 
     * 
     * @memberOf create
     */
    init(){
        const _ts = this,
            name = _ts.projectName;

        let exec = require('child_process').exec;

        // exec('rm -r -f demo',(err,out)=>{
        //     if(err){
        //         tip.error(err);
        //     }else{
                if(name === undefined){
                    //如果没有输入项目名则不允许继续操作
                    tip.error('项目名称不允许为空');
                    return;
                }else{
                    //检查项目目录是否已经存在
                    let dirIsExist = pathInfo(path.join(fws.cmdPath,name)).type === 'dir';
                    
                    //项目已经存在则不创建，反之创建对应的项目
                    if(dirIsExist){
                        tip.error(`警告："${name}"目录已存在。请更换项目名称或删除原有项目之后重试。`);
                    }else{
                        let type = _ts.getType();

                        if(type){
                            _ts.createEntry(name,type);
                        }else{
                            tip.error('请指定有效的项目类型！');
                        };
                        
                    };
                };
        //     };
        // });
    }

    /**
     * 获取并检查用户所传入的类型
     * 
     * @returns string|undefined
     * 
     * @memberOf create
     */
    getType(){
        const _ts = this;
        
        let templateFilePath = path.join(fws.tplConfigPath,_ts.templateName+'.json'),
            tplConfig;

        if(pathInfo(templateFilePath).type === 'file'){
            tplConfig = JSON.parse(fs.readFileSync(templateFilePath));
        }else{
            tip.error('模版文件 "'+templateFilePath+'" 不存在');
        };
        return tplConfig;
    }

    /**
     * 项目创建方法
     * 
     * @param {string} projectPath  项目的路径
     * @param {object} tplConfig    项目结构的配置信息
     * 
     * @memberOf create
     */
    createFn(projectPath,tplConfig){
        const _ts = this;

        //遍历对象，开始创建文件和目录
        let eachCreate,
            starTime = new Date().valueOf();

        (eachCreate = (o,p)=>{
            for(let i in o){
                
                let currentPath = path.join(p);                                 //得到当前路径

                if(i === "__files__"){
                    /**创建文件开始 */

                    let queue = o[i];                                           //创建队列

                    queue.forEach((item,index)=>{
                        let _src = path.join(fws.tplPath,item[0]);              //母板
                        let _target = path.join(currentPath,item[1]);           //目标

                        fs.stat(_src,(err,file)=>{
                            if(err){
                                tip.error(err);
                            }else if(file.isFile()){
                                
                                let readAble = fs.createReadStream(_src),       //创建读取流
                                    writAble = fs.createWriteStream(_target);   //创建写入流
                                
                                readAble.pipe(writAble);                        //通过管道来传输

                                tip.success(`创建文件 ${_target}`);
                                tip.gray(`用时：${new Date().valueOf() - starTime} ms`);
                            };
                        });
                    });
                }else if(i !== '__name__'){
                    currentPath = path.join(currentPath,i);                     //设置当前路径为新的目录
                    fs.mkdirSync(path.join(currentPath));                       //创建目录
                    tip.success(`创建目录 ${path.join(currentPath)}`);;
                    tip.gray(`用时：${new Date().valueOf() - starTime} ms`);
                    
                    if(getType(o[i]) === 'object'){
                        eachCreate(o[i],currentPath);                          //如果是目录则无限级循环
                    };
                };
            };
        })(tplConfig,projectPath);
    }

    /**
     * 创建入口
     * 
     * @param {string} name 项目的名称
     * @param {string} tplConfig 项目的配置文件
     * 
     * @memberOf create
     */
    createEntry(name,tplConfig){
        const _ts = this;

        //如果有获取到配置文件，则开始创建项目        
        let projectPath = path.join(fws.cmdPath,name);

        fws.srcPath = path.join(projectPath,'/src'),
        fws.devPath = path.join(projectPath,'/dev'),
        fws.distPath = path.join(projectPath,'/dist');
        

        //创建项目目录
        fs.mkdirSync(projectPath);

        fs.mkdirSync(fws.srcPath);
        fs.mkdirSync(fws.devPath);
        fs.mkdirSync(fws.distPath);

        //创建项目配置文件
        let project_fwsConfigContent = {
            //作者、邮箱
            author:fws.config.author,
            mail:fws.config.mail,

            //资源匹配替换
            srcReplace:fws.config.srcReplace,

            //源文件目录同步路径
            srcSync:fws.config.srcSync,

            //编译目录同步路径
            devSync:fws.config.devSync,

            //发布目录同步路径
            distSync:fws.config.distSync
        };

        project_fwsConfigContent = 'module.exports = '+JSON.stringify(project_fwsConfigContent,null,2);

        console.log(fws);
            
        fs.writeFileSync(path.join(projectPath,'fws_config.js'),project_fwsConfigContent);

        //根据配置文件创建文件
        _ts.createFn(fws.srcPath,tplConfig);
    }
};

module.exports = {
    regTask:{
        command:'[name]',
        description:'创建一个新的空项目',
        option:[
            ['-t, --template [template]','可选，指定项目类型，默认pc。可选参数 '+aConfigList.toString()]
        ],
        help:()=>{
            console.log(`  Examples:`);
            console.log(``);
            tip.highlight(`     如何自定义项目模版见 "${fws.tplPath}"`);
        },
        action:create
    },
    fun:()=>{}
};