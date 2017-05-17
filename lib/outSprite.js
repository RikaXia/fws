'use strict';
const path = require('path');

const fs = require('fs-extra');
const spritesmith = require('spritesmith');
const svgstore = require('svgstore');

const pathInfo = require('./getPathInfo');
const tip = require('./tip');


/**
 * 精灵图生成
 * 
 * @class OutSprite
 * {
 *  inImgsDir:'',     图片文件夹
 *  outSpriteDir:'',   精灵图输出目录
 *  outScssDir:'',     scss输出目录
 *  callback:()=>{} 回调
 * }
 */
class OutSprite{
    constructor(option){
        const _ts = this;

        option = option || {};

        let config = _ts.config = {};

        for(let i in option){
            config[i] = option[i];
        };

        //当没有传入参数的时候
        let backDir =  path.resolve(__dirname,'..');
        
        config.inImgsDir = config.inImgsDir === undefined ? __dirname : config.inImgsDir;
        config.outSpriteDir = config.outSpriteDir === undefined ? backDir : config.outSpriteDir;
        config.outScssDir = config.outScssDir === undefined ? backDir : config.outScssDir;

        _ts.init();
    }

    init(){
        const _ts = this;

        let config = _ts.config,
            dirName = (()=>{
                let pathDirs = config.inImgsDir.split(path.sep);
                return pathDirs[pathDirs.length-1];
            })(),
            imgs = _ts.getImgList();
            
        //png精灵图生成
        let pngMotor = (err,result)=>{
            if(err){
                tip.error(err);
            }else{
                //精灵数据
                let spriteData = {
                        size:{},
                        spriteNames:[],                    
                        element:{},
                        url:'',
                        path:''                            
                    },
                    spriteDist = path.join(config.outSpriteDir,dirName+'.png');
                
                //保存精灵图
                fs.writeFileSync(spriteDist,result.image);
                tip.success(spriteDist + ' 输出成功');

                //精灵图url
                spriteData.url = (()=>{
                    let sPath = '';

                    //如果不是在fws环境下使用，图片url为文件名，否则根据fws.srcPath的目录来生成相对的
                    if(global.fws){
                        let surl = spriteDist.replace(fws.srcPath,'');
                            //sPath = '..';
                        surl = surl.split(path.sep);
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
                        let fileType = path.extname(i),
                            fileName = path.basename(i,fileType);
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
                    spriteDataSavePath = path.join(config.outScssDir,'_spriteData',dirName+'.scss');

                sSpriteData = sSpriteData.replace('"_!@!&_','(');
                sSpriteData = sSpriteData.replace('_&!@!_"',')');
                sSpriteData = sSpriteData.replace(/{/g,'(');
                sSpriteData = sSpriteData.replace(/}/g,')');

                sSpriteData = '$'+dirName+': '+sSpriteData;

                //保存精灵图数据到目录
                let spriteDataSaveDir = path.dirname(spriteDataSavePath);
                fs.ensureDir(spriteDataSaveDir,(err)=>{
                    if(err){
                        tip.error(err);
                    }else{
                        //生成编译出的scss文件
                        fs.writeFileSync(spriteDataSavePath,sSpriteData);
                        tip.success(`${spriteDataSavePath} 输出成功`);

                        //更新"scss/_spriteData.scss"文件
                        let aSdFileList = fs.readdirSync(spriteDataSaveDir),
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
                        let _fws_spriteDataPath = path.join(config.outScssDir,'_fws_spriteData.scss');
                        fs.writeFileSync(_fws_spriteDataPath,_spriteDataContent);
                        tip.success(_fws_spriteDataPath + ' 更新成功');

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

            spritesmith.run(con,pngMotor);
        };

        //svg精灵图生成
        if(imgs.svgList.length){
            let sprites = svgstore(),
                spriteDist = path.join(config.outSpriteDir,dirName+'.svg');
            
            //将svg文件添加到组件
            imgs.svgList.forEach((item,list)=>{
                let elementName = path.basename(item,path.extname(item));       
                sprites.add(elementName,fs.readFileSync(item,'utf8'));
            });
            fs.writeFileSync(spriteDist,sprites);
        };

        if(config.callback === 'function'){
            config.callback();
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
        if(pathInfo(config.inImgsDir).type === 'dir'){
            let files = fs.readdirSync(config.inImgsDir);
            
            files.forEach((item,index)=>{
                let type = item.substr(item.length - 4,4).toLowerCase();

                switch (type) {
                    case '.png':
                        imgs.pngList.push(path.join(config.inImgsDir,item));
                    break;
                
                    case '.svg':
                        imgs.svgList.push(path.join(config.inImgsDir,item));
                    break;
                };
            });
        }else{
            tip.error(config.inImgsDir + ' 不是一个有效的目录')
        };
        return imgs;
    }

};

module.exports = OutSprite;



