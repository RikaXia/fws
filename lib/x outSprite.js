'use strict';

/**
 * 精灵图生成
 * 
 * @class OutSprite
 * {
 *  inImgsDir:'',     图片文件夹
 *  outSpriteDir:'',  精灵图输出目录
 *  outScssDir:'',    scss输出目录
 *  callback:()=>{} 回调
 * }
 */
class OutSprite{
    constructor(option){
        const _ts = this;

        _ts.m = {
            path:require('path'),
            fs:require('fs-extra'),
            spritesmith:require('spritesmith'),
            svgstore:require('svgstore'),
            pathInfo:require('./getPathInfo'),
            tip:require('./tip')
        };

        option = option || {};

        let config = _ts.config = {};

        for(let i in option){
            config[i] = option[i];
        };

        //当没有传入参数的时候
        let backDir =  _ts.m.path.resolve(__dirname,'..');
        
        config.inImgsDir = config.inImgsDir === undefined ? __dirname : config.inImgsDir;
        config.outSpriteDir = config.outSpriteDir === undefined ? backDir : config.outSpriteDir;
        config.outScssDir = config.outScssDir === undefined ? backDir : config.outScssDir;

        try {
            _ts.init();
        } catch (error) {
            _ts.m.tip.error(error);
        };        
    }

    init(){
        const _ts = this;

        let config = _ts.config,
            dirName = (()=>{
                let pathDirs = config.inImgsDir.split(_ts.m.path.sep);
                return pathDirs[pathDirs.length-1];
            })(),
            imgs = _ts.getImgList();
            
        //png精灵图生成
        let pngMotor = (err,result)=>{
            if(err){
                _ts.m.tip.error(err);
            }else{
                //精灵数据
                let spriteData = {
                        size:{},
                        spriteNames:[],                    
                        element:{},
                        url:'',
                        path:''                            
                    },
                    spriteDist = _ts.m.path.join(config.outSpriteDir,dirName+'.png');
                
                //保存精灵图
                _ts.m.fs.writeFileSync(spriteDist,result.image);
                _ts.m.tip.success(spriteDist + ' 输出成功');
                
                if(config.callback === 'function'){
                    config.callback({
                        status:'success',
                        path:spriteDist
                    });
                };

                //精灵图url
                spriteData.url = (()=>{
                    let sPath = '';

                    //如果不是在fws环境下使用，图片url为文件名，否则根据fws.srcPath的目录来生成相对的
                    if(global.fws){
                        let surl = spriteDist.replace(fws.srcPath,'');
                            //sPath = '..';
                        surl = surl.split(_ts.m.path.sep);
                        surl.forEach((item,index)=>{
                            if(item !== ''){
                                let sep = !sPath ? '' : '/';
                                sPath += sep+item;
                            };
                        });
                    }else{
                        sPath = dirName+'.png';
                    };                    
                    return sPath;
                })();

                spriteData.path = spriteDist;

                //精灵图元素数据
                if(result.coordinates){
                    for(let i in result.coordinates){
                        let fileType = _ts.m.path.extname(i),
                            fileName = _ts.m.path.basename(i,fileType);
                        spriteData.spriteNames.push(fileName);
                        spriteData.element[fileName] = result.coordinates[i];
                    };
                };
                spriteData.spriteNames = '_!@!&_'+spriteData.spriteNames.toString()+'_&!@!_';

                //精灵图大小
                if(result.properties){
                    spriteData.size.width = result.properties.width;
                    spriteData.size.height = result.properties.height;
                };

                let sSpriteData = JSON.stringify(spriteData,null,2),
                    spriteDataSavePath = _ts.m.path.join(config.outScssDir,'_spriteData',dirName+'.scss');

                sSpriteData = sSpriteData.replace('"_!@!&_','(');
                sSpriteData = sSpriteData.replace('_&!@!_"',')');
                sSpriteData = sSpriteData.replace(/{/g,'(');
                sSpriteData = sSpriteData.replace(/}/g,')');

                sSpriteData = '$'+dirName+': '+sSpriteData;

                //保存精灵图数据到目录
                let spriteDataSaveDir = _ts.m.path.dirname(spriteDataSavePath);
                _ts.m.fs.ensureDir(spriteDataSaveDir,(err)=>{
                    if(err){
                        _ts.m.tip.error(err);
                    }else{
                        //生成编译出的scss文件
                        _ts.m.fs.writeFileSync(spriteDataSavePath,sSpriteData);
                        _ts.m.tip.success(`${spriteDataSavePath} 输出成功`);

                        //更新"scss/_spriteData.scss"文件
                        let aSdFileList = _ts.m.fs.readdirSync(spriteDataSaveDir),
                            aSdList = [],
                            _spriteDataContent = '@charset "utf-8";\r\n//以下内容由程序自动更新\r\n',
                            re = /^(\w*).(scss)$/i;
                        
                        //筛选出非标准的.scss文件
                        aSdFileList.forEach((item,index)=>{
                            if(re.test(item)){
                                _spriteDataContent += '@import "./_spriteData/'+item+'";\r\n';
                                aSdList.push(item);
                            };
                        });

                        //更新
                        let _fws_spriteDataPath = _ts.m.path.join(config.outScssDir,'_spriteData.scss');
                        _ts.m.fs.writeFileSync(_fws_spriteDataPath,_spriteDataContent);
                        _ts.m.tip.success(_fws_spriteDataPath + ' 更新成功');

                    };
                });   
            };
        };

        if(imgs.pngList.length){
            let con = {
                src:imgs.pngList,
                padding:4,
                algorithm:'binary-tree'
            };
            
            //图像合并引擎添加
            if(fws.config.imgEngine !== ''){
                con.engine = require(fws.config.imgEngine);
            };

            _ts.m.spritesmith.run(con,pngMotor);
        };

        //svg精灵图生成
        if(imgs.svgList.length){
            let sprites = _ts.m.svgstore(),
                spriteDist = _ts.m.path.join(config.outSpriteDir,dirName+'.svg');
            
            //将svg文件添加到组件
            imgs.svgList.forEach((item,list)=>{
                let elementName = _ts.m.path.basename(item,_ts.m.path.extname(item));       
                sprites.add(elementName,_ts.m.fs.readFileSync(item,'utf8'));
            });
            _ts.m.fs.writeFileSync(spriteDist,sprites);

            if(config.callback === 'function'){
                config.callback({
                    status:'success',
                    path:spriteDist
                });
            };
        };                
    }

    //获取图片列表
    getImgList(){
        const _ts = this;
        let config = _ts.config;

        let imgs = {
            'pngList':[],
            'svgList':[]
        };
        if(_ts.m.pathInfo(config.inImgsDir).type === 'dir'){
            let files = _ts.m.fs.readdirSync(config.inImgsDir);
            
            files.forEach((item,index)=>{
                let type = item.substr(item.length - 4,4).toLowerCase();

                switch (type) {
                    case '.png':
                        imgs.pngList.push(_ts.m.path.join(config.inImgsDir,item));
                    break;
                
                    case '.svg':
                        imgs.svgList.push(_ts.m.path.join(config.inImgsDir,item));
                    break;
                };
            });
        }else{
            _ts.m.tip.error(config.inImgsDir + ' 不是一个有效的目录')
        };
        return imgs;
    }

};

module.exports = OutSprite;



