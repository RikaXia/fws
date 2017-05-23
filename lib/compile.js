'use strict';
/**
 * 文件编译处理
 * 
 * @class Compile
 * {
 *  src:'',                 //输入文件
 *  dist:undefined,         //输出模块，不指定由编译模块处理
 *  debug:true,             //开启debug模式，会生成map并编译到dev目录
 *  callback:function(){}   //回调
 * }
 */
class Compile{
    constructor(option){
        const _ts = this;
        _ts.m = {
            fs:require('fs-extra'),
            path:require('path'),
            pathInfo:require('./getPathInfo'),
            tip:require('./tip')
        };

        option = option || {};

        _ts.config = {};
        for(let i in option){
            _ts.config[i] = option[i];
        };

        _ts.config.debug = _ts.config.debug === true ? _ts.config.debug : false;

        //确定传入的文件是有效的再开始处理
        if(_ts.m.pathInfo(_ts.config.src).type === 'file'){
            _ts.init();
        }else{
            _ts.m.tip.error(_ts.config.src + ' 文件不存在');
        };
    }
    
    init(){
        const _ts = this;
        let config = _ts.config;

        //得到文件的类型、名称、以及首字母        
        _ts.fileType = _ts.m.path.extname(config.src).toLowerCase();                      //文件类型
        _ts.fileName = _ts.m.path.basename(config.src,_ts.fileType);                      //文件名称
        _ts.filePrefix = _ts.fileName ? _ts.fileName.substr(0,1) : undefined;       //得取文件第一个字符，用于决定是否为公共文件

        //设置输出目录
        _ts.setDist();

        //开始编译
        _ts.compile();
    }
    //编译
    compile(){
        const _ts = this;
        let config = _ts.config;

        //检查如果是忽略的目录文件不作处理
        //是公共可编译的文件，也不作处理。由调用任务的组件，去处理编译项目内所有同类型的文件
        if(_ts.ignore() || _ts.filePrefix === '_' && _ts.isLinkedFile()){
            _ts.outSprite();
            return;
        };

        //检查仅同步的，直接复制过去
        if(_ts.onlySync()){
            _ts.copy(config.src,config.dist);
            return;
        };

        //检查是否为精灵图
        if(_ts.isSprite()){
            _ts.outSprite();
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
            case '.es':case '.es6':
                _ts.es2js();
            break;
            default:
                _ts.copy(config.src,config.dist,_ts.config.callback);
            break;
        };
    }
    //输灵图输出
    outSprite(){
        const _ts = this;
        _ts.m.OutSprite = require('./outSprite');        //精灵图处理

        let config = _ts.config,
            dirName = _ts.m.path.dirname(config.src),
            isTimeUp = (()=>{
                return fws_spriteTime[dirName] !== undefined && new Date().valueOf() - fws_spriteTime[dirName] > 3000
            })();
        
        //初次编译或者距离上一次编译3秒以上才会再次触发精灵图处理
        if(!fws_spriteTime[dirName] || isTimeUp){
            fws_spriteTime[dirName] = new Date().valueOf();

            //编译处理精灵图
            let spriteImgDir = _ts.m.path.dirname(config.src);
            new _ts.m.OutSprite({
                inImgsDir:spriteImgDir,
                outSpriteDir:_ts.m.path.resolve(spriteImgDir,'..'),
                outScssDir:_ts.m.path.join(fws.srcPath,'css')
            });
        };
    }

    //es编译为js
    es2js(){
        const _ts = this;
        _ts.m.Es2js = require('./es2js');               //es编译

        let config = _ts.config;
        new _ts.m.Es2js({
            src:config.src,
            dist:config.dist,
            debug:config.debug,
            callback:_ts.config.callback
        });
    }

    //jsx编译为js
    jsx2js(){
        const _ts = this;
        _ts.m.Jsx2js = require('./jsx2js');             //jsx编译js
        let config = _ts.config;
        new _ts.m.Jsx2js({
            src:config.src,
            dist:config.dist,
            debug:config.debug,
            callback:_ts.config.callback
        });
    }

    //tsx、ts编译为jsx或js
    ts2(){
        const _ts = this;
        _ts.m.Ts2 = require('./ts2');                   //typescript编译js
        let config = _ts.config;
        new _ts.m.Ts2({
            src:config.src,
            dist:config.dist,
            debug:config.debug,
            callback:_ts.config.callback
        });
    }

    //sass编译为html
    sass2html(){
        const _ts = this;
        _ts.m.Sass2css = require('./sass2css');         //sass编译css
        let config = _ts.config;
        new _ts.m.Sass2css({
            src:config.src,
            dist:config.dist,
            debug:config.debug,
            callback:_ts.config.callback
        });
    }

    //pug编译html
    pug2html(){
        const _ts = this;
        _ts.m.Pug2html = require('./pug2html');         //pug编译html
        let config = _ts.config,
            op = {
                src:config.src,
                dist:config.dist,
                debug:config.debug,
                callback:_ts.config.callback
            },
            dataFile = _ts.m.path.join(fws.srcPath,'data',_ts.fileName + '.js');
        
        if(_ts.m.pathInfo(dataFile).extension === '.js'){
            op.data = fws.require(dataFile);
        };        
        new _ts.m.Pug2html(op);
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
            config.dist = _ts.m.path.join(_ts.m.path.dirname(config.src.replace(fws.srcPath,fws.devPath)),_ts.fileName + outExtName);
        }
        //非开发模式下，未指定输出目录的。dist路径为dist相对应的路径
        else if(config.dist === undefined && !config.debug){
            config.dist = _ts.m.path.join(_ts.m.path.dirname(config.src.replace(fws.srcPath,fws.distPath)),_ts.fileName + outExtName);
        };

        //.tsx编译到src目录
        if(_ts.fileType === '.tsx' && config.debug){
            config.dist = config.dist.replace(fws.devPath,fws.srcPath);
        }else if(_ts.fileType === '.tsx' && !config.debug){
            config.dist = config.dist.replace(fws.distPath,fws.srcPath);
        };
    }
    
    //复制文件
    copy(src,dist,callback){
        const _ts = this;
        _ts.m.fs.copy(src,dist,(err)=>{
            if(err){
                _ts.m.tip.error(err);

                if(typeof callback === 'function'){
                    callback({
                        status:'error',
                        path:dist
                    });
                };
                
            }else{
                if(typeof callback === 'function'){
                    callback({
                        status:'success',
                        path:dist
                    });
                };
                _ts.m.tip.highlight('同步 ' + dist);
            };
        });
    }

    //检查文件是否忽略
    ignore(){
        const _ts = this;
        let config = _ts.config,
            ignoreType = ['.psd','.psb','.tmp','.ini','.DS_Store','.map'],      //忽略的文件类型
            ignoreDir = [                                                       //忽略的目录
                _ts.m.path.join(fws.srcPath,'data/')
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
                let adirNames = _ts.m.path.dirname(config.src).split(_ts.m.path.sep),
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
        
        let aDirs = _ts.m.path.dirname(config.src).split(_ts.m.path.sep);

        return aSyncDir.some((item,index)=>{
            return aDirs.some((_item,_index)=>{
                return item === _item;
            });
        });
    }
};


module.exports = Compile;



