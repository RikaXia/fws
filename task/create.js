'use strict';
const fs = require('fs');
const path = require('path');

const program = require('commander');               //（https://github.com/tj/commander.js）

const tip = require('../lib/tip');                  //文字提示
const getType = require('../lib/getType');          //获取数据类型
//const isExist = require('../lib/isExist');          //判断文件或目录是否存在
const pathInfo = require('../lib/getPathInfo');      //获取目标路径的相关信息


let aConfigList = fs.readdirSync(fws.tplConfigPath),//获取所有配置文件列表
    aConfigListPath = [],                           //配置文件的具体路径
    //re = /\.json$/;
    re = /^([a-g]|[i-u]|[w-z]){1}__([a-z]{1,}(.json)$)/i;

let tplConfig = {};                                 //模版配置数据存放
let commanderOption = [];                           //命令参数配置


//遍历文件列表，得到文件的具体路径
aConfigList.forEach((item,index)=>{
    let temp = path.join(fws.tplConfigPath,item);
    aConfigListPath.push(temp);
});

//处理模版数据
aConfigListPath.forEach((item,index)=>{
    let fileName = path.basename(item);

    //检查如果是一个有效的模版配置文件则是将数据处理保存到 tplConfig 将生成对应的配置信息
    if(re.test(fileName)){
        let key = fileName.replace(/(.json)$/i,''),
            val = JSON.parse(fs.readFileSync(item).toString());
        
        tplConfig[key] = val;

        //设置任务的相关参数
        if(val.__name__ === undefined){
            tip.error(`${item} 缺少有效的模版名称 (__name__)`);
        }else{
            let param = key.split('__');
            commanderOption.push([`-${param[0]}`,`--${param[1]}`,`    创建一个【${val.__name__}】项目`]);
        };
    };
});

class create{
    constructor(name,options){
        const _ts = this;

        //将命令传入的名称，和参数绑定到对象之上
        _ts.projectName = name;
        _ts.rojectOptions = options;

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

        exec('rm -r -f demo',(err,out)=>{
            if(err){
                tip.error(err);
            }else{
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
            };
        });
    }

    /**
     * 获取并检查用户所传入的类型
     * 
     * @returns string|undefined
     * 
     * @memberOf create
     */
    getType(){
        const _ts = this,
            options = _ts.rojectOptions;
        
        let type;

        //检查传入的参数所对应的配置是否存在
        for(let i in tplConfig){
            let pream = i.split('__');
            if(options[pream[1]]){
                type = i;
                break;
            };
        };
        return type;
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
                        let _src = path.join(fws.tplPath,item[0]);                  //母板
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
     * @param {string} type 项目的类型
     * 
     * @memberOf create
     */
    createEntry(name,type){
        const _ts = this;

        //如果有获取到配置文件，则开始创建项目
        if(tplConfig[type]){
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
            let project_fwsConfigContent = 
`module.exports = {
	//自动刷新
	autoRefresh:true,

	//资源匹配替换
	srcReplace:[
		["localFile","cdnFilePath"]
	],

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
};`
            ;
            
            fs.writeFileSync(path.join(projectPath,'fws_config.js'),project_fwsConfigContent);

            //根据配置文件创建文件
            _ts.createFn(fws.srcPath,tplConfig[type]);
        };
    }
}



module.exports = {
    regTask:{
        command:'[name]',
        description:'创建一个新的空项目',
        option:commanderOption,
        help:()=>{
            console.log(`  Examples:`);
            console.log(``);

            tip.highlight(`     fws create -h       查看帮助`);
            tip.highlight(`     自定义项目模版见 "${fws.tplPath}"`);
        },
        action:create
    },
    fun:()=>{}
};




// /**
//  * 
//  * @param {string} projectPath 项目名称
//  * @param {object} tplConfig 项目的依赖关系和文件结构Json对象
//  */
// let createFn = (projectPath,tplConfig)=>{

//     //遍历对象，开始创建文件和目录
//     let eachCreate,
//         starTime = new Date().valueOf();

//     (eachCreate = (o,p)=>{
//         for(let i in o){
            
//             let currentPath = path.join(p);                                 //得到当前路径

//             if(i === "__files__"){
//                 /**创建文件开始 */

//                 let queue = o[i];                                           //创建队列

//                 queue.forEach((item,index)=>{
//                     let _src = path.join(fws.tplPath,item[0]);                  //母板
//                     let _target = path.join(currentPath,item[1]);           //目标

//                     fs.stat(_src,(err,file)=>{
//                         if(err){
//                             tip.error(err);
//                         }else if(file.isFile()){
                            
//                             let readAble = fs.createReadStream(_src),       //创建读取流
//                                 writAble = fs.createWriteStream(_target);   //创建写入流
                            
//                             readAble.pipe(writAble);                        //通过管道来传输

//                             tip.success(`创建文件 ${_target}`);
//                             tip.gray(`用时：${new Date().valueOf() - starTime} ms`);
//                         };
//                     });
//                 });
//             }else{
//                 currentPath = path.join(currentPath,i);                     //设置当前路径为新的目录
//                 fs.mkdirSync(path.join(currentPath));                       //创建目录
//                 tip.success(`创建目录 ${path.join(currentPath)}`);;
//                 tip.gray(`用时：${new Date().valueOf() - starTime} ms`);
                
//                 if(getType(o[i]) === 'object'){
//                      eachCreate(o[i],currentPath);                          //如果是目录则无限级循环
//                 };
//             };
//         };
//     })(tplConfig,projectPath);
// };




// /**
//  * 创建指定类型的项目
//  * @param {string} name 项目文件夹名称
//  * @param {string} type 项目类型
//  */
// let createInit = (name,type)=>{
//     let configPath = path.join(fws.tplConfigPath,type+'.json'),
//         configData;
    

//     try {
//         //let configFile = fs.statSync(configPath);
//         //if(configFile.isFile()){

//         let configContent = fs.readFileSync(configPath).toString();

//         configData = JSON.parse(configContent);


//         //};
//     } catch (err) {
//         tip.error(err);
//         tip.error(`请检查对应的模版配置文件是否存在`);
//     };


//     //如果有获取到配置文件，则开始创建项目
//     if(configData){
//         let projectPath = path.join(fws.cmdPath,name);


//         //创建项目目录
//         fs.mkdirSync(projectPath);

//         //根据配置文件创建文件
//         createFn(projectPath,configData);
//     };
// };

// let init = (name,options)=>{
//     let exec = require('child_process').exec;

//     console.log(options);

//     if(name === undefined){
//         //如果没有输入项目名则不允许继续操作
//         tip.error('项目名称不允许为空');
//         return;
//     }else{
//         //检查项目目录是否已经存在
//         let dirIsExist = pathInfo(path.join(fws.cmdPath,name)).type === 'dir';
        
//         //项目已经存在则不创建，反之创建对应的项目
//         if(dirIsExist){
//             tip.error(`警告："${name}"目录已存在。请更换项目名称或删除原有项目之后重试。`);
//         }else{
//             createInit(name,'pc')
//         };
//     };


//     // exec('rm demo -rf',(err,out)=>{
//     //     if(err){
//     //         tip.error(err);
//     //     }else{
            
//     //     };
//     // });
// };
