'use strict';
const fs = require('fs-extra');
const path = require('path');

const pathInfo = require('./getPathInfo');
const tip = require('./tip');
const Sass2css = require('./sass2css');        //sass编译css
const Pug2html = require('./pug2html');        //pug编译html
const Ts2 = require('./ts2');              //typescript编译js
const Jsx2js = require('./Jsx2js');            //jsx编译js
const OutSprite = require('./outSprite');      //精灵图处理

class Compile{
    constructor(option){
        const _ts = this;
        option = option || {};

        _ts.config = {};
        for(let i in option){
            _ts.config[i] = option[i];
        };

        //确定传入的文件是有效的再开始处理
        if(pathInfo(_ts.config.src).type === 'file'){
            _ts.init();
        }else{
            tip.error(_ts.config.src + ' 文件不存在');
        };
    }
    
    init(){
        const _ts = this;
        let config = _ts.config;

        //得到文件的类型、名称、以及首字母        
        _ts.fileType = path.extname(config.src).toLowerCase();                      //文件类型
        _ts.fileName = path.basename(config.src,_ts.fileType);                      //文件名称
        _ts.filePrefix = _ts.fileName ? _ts.fileName.substr(0,1) : undefined;       //得取文件第一个字符，用于决定是否为公共文件

        //设置输出目录
        _ts.setDist();

        _ts.compile();
    }
    //编译
    compile(){
        const _ts = this;
        let config = _ts.config;

        //检查如果是忽略的目录文件不作处理
        //是公共可编译的文件，也不作处理。由调用任务的组件，去处理编译项目内所有同类型的文件
        if(_ts.ignore() || _ts.filePrefix === '_' && _ts.isLinkedFile()){
            return;
        };

        //检查仅同步的，直接复制过去
        if(_ts.onlySync()){
            _ts.copy(config.src,config.dist);
            return;
        };

        //检查是否为精灵图
        if(_ts.isSprite()){
            let dirName = path.dirname(config.src),
                isTimeUp = (()=>{
                    return fws_spriteTime[dirName] !== undefined && new Date().valueOf() - fws_spriteTime[dirName] > 3000
                })();
            
            //初次编译或者距离上一次编译3秒以上才会再次触发精灵图处理
            if(!fws_spriteTime[dirName] || isTimeUp){
                fws_spriteTime[dirName] = new Date().valueOf();

                //编译处理精灵图
                let spriteImgDir = path.dirname(config.src);
                new OutSprite({
                    inImgsDir:spriteImgDir,
                    outSpriteDir:path.resolve(spriteImgDir,'..'),
                    outScssDir:path.join(fws.srcPath,'css')
                });
            };
            return;
        };

        switch (_ts.fileType) {
            case '.pug':
                _ts.pug2html();
            break;
            case '.scss':
                _ts.sass2html();
            break;
            case '.ts':case '.tsx':
                _ts.ts2();
            break;
            case '.jsx':
                _ts.jsx2js();
            break;
            default:
                _ts.copy(config.src,config.dist);
            break;
        };
    }

    //jsx编译为js
    jsx2js(){
        const _ts = this;
        let config = _ts.config;
        new Jsx2js({
            src:config.src,
            dist:config.dist,
            debug:true
        });
    }

    //tsx、ts编译为jsx或js
    ts2(){
        const _ts = this;
        let config = _ts.config;
        new Ts2({
            src:config.src,
            dist:config.dist,
            debug:true
        });
    }

    //sass编译为html
    sass2html(){
        const _ts = this;
        let config = _ts.config;
        new Sass2css({
            src:config.src,
            dist:config.dist,
            debug:true
        });
    }

    //pug编译html
    pug2html(){
        const _ts = this;
        let config = _ts.config,
            op = {
                src:config.src,
                dist:config.dist,
                debug:true
            },
            dataFile = path.join(fws.srcPath,'data',_ts.fileName + '.js');
        
        if(pathInfo(dataFile).extension === '.js'){
            op.data = require(dataFile);
        };        
        new Pug2html(op);
    }

    //是否可编译
    isLinkedFile(){
        const _ts = this;
        let aLinked = ['.pug','.scss','.ts','.tsx','.jsx','.es','.es6'];
        return aLinked.some((item,index)=>{
            return item === _ts.fileType;
        });
    }
    
    //设置输出目录
    setDist(){
        const _ts = this;
        let config = _ts.config,
            correspondence = {
                '.pug':'.html',
                '.scss':'.css',
                '.ts':'.js',                
                '.tsx':'.jsx',
                '.jsx':'.js',
                '.es':'.js',
                '.es6':'.js'
            },
            outExtName = correspondence[_ts.fileType] !== undefined ? correspondence[_ts.fileType] : _ts.fileType;
        
        //开发模式下，且未指定输出目录的。dist路径为dev相对应的路径
        if(config.dist === undefined && config.debug){
            config.dist = path.join(path.dirname(config.src.replace(fws.srcPath,fws.devPath)),_ts.fileName + outExtName);
        }
        //非开发模式下，未指定输出目录的。dist路径为dist相对应的路径
        else if(config.dist === undefined && !config.debug){
            config.dist = path.join(path.dirname(config.src.replace(fws.srcPath,fws.distPath)),_ts.fileName + outExtName);
        };

        //.tsx编译到src目录
        if(_ts.fileType === '.tsx'){
            config.dist = config.dist.replace(fws.devPath,fws.srcPath);
        };
    }
    
    //复制文件
    copy(src,dist,callback){
        fs.copy(src,dist,(err)=>{
            if(err){
                tip.error(err);
                callback('error');
            }else{
                if(typeof callback === 'function'){
                    callback('success');
                };
                tip.highlight('同步 ' + dist);
            };
        });
    }

    //检查文件是否忽略
    ignore(){
        const _ts = this;
        let config = _ts.config,
            ignoreType = ['.psd','.psb','.tmp','.ini','.DS_Store','.map'],      //忽略的文件类型
            ignoreDir = [                                                       //忽略的目录
                path.join(fws.srcPath,'data/')
            ];
        
        for(let i = 0,len = ignoreDir.length; i < len; i++){
            if(config.src.indexOf(ignoreDir[i]) === 0){
                return true;
            };
        };

        return ignoreType.some((item,index)=>{
            return _ts.fileType === item;
        });
    }

    //检查是否为精灵图
    isSprite(){
        const _ts = this;
        let config = _ts.config,
            isSpriteDir = (()=>{
                let adirNames = path.dirname(config.src).split(path.sep),
                    dirName = adirNames[adirNames.length - 1].toLowerCase();
                return dirName.indexOf('_sprite') === 0;
            })(),
            isImg = _ts.fileType === '.png' || _ts.fileType === '.svg';

        return isSpriteDir && isImg;
    }

    //是否仅同步，例如：node_modules/
    onlySync(){
        const _ts = this;
        let config = _ts.config,
            aSyncDir = ['node_modules'];
        
        let aDirs = path.dirname(config.src).split(path.sep);

        return aSyncDir.some((item,index)=>{
            return aDirs.some((_item,_index)=>{
                return item === _item;
            });
        });
    }
};


module.exports = Compile;



