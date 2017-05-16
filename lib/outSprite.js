'use strict';
const path = require('path');

const fs = require('fs-extra');
const spritesmith = require('spritesmith');
const svgstore = require('svgstore');

const pathInfo = require('./getPathInfo');
const tip = require('./tip');


class outSprite{
    constructor(spriteDirPath){
        const _ts = this;
        _ts.path = spriteDirPath;

        _ts.init();
    }
    init(){
        const _ts = this;
        
        let imgs = _ts.getImgList(),

            //目录名称
            dirName = (()=>{
                let pathDirs = _ts.path.split(path.sep);
                return pathDirs[pathDirs.length-1];
            })();

        //png精灵图处理，生成合成图片，输出对应scss文件
        if(imgs.pngList.length){
            spritesmith.run({
                src:imgs.pngList,
                padding:4,
                algorithm:'binary-tree'
                //,engine:require('canvassmith')
            },(err,result)=>{
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
                        spriteDist = path.resolve(_ts.path,'..',dirName+'.png');
                    
                    //保存精灵图
                    fs.writeFileSync(spriteDist,result.image);

                    //精灵图url
                    spriteData.url = (()=>{
                        let surl = spriteDist.replace(fws.srcPath,''),
                            sPath = '';
                            //sPath = '..';
                        surl = surl.split(path.sep);
                        surl.forEach((item,index)=>{
                            if(item !== ''){
                                let sep = !sPath ? '' : '/';
                                sPath += sep+item;
                            };
                        });
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
                        spriteDataSavePath = path.join(fws.srcPath,'scss','_spriteData',dirName+'.scss');
                    sSpriteData
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
                            //生成编译出的css文件
                            fs.writeFileSync(spriteDataSavePath,sSpriteData);
                            tip.success(`${spriteDataSavePath} 输出成功`);

                            //更新"scss/_spriteData.scss"文件
                            if(pathInfo(spriteDataSaveDir).type === 'dir'){
                                //读取数据目录所有文件
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

                                fs.writeFileSync(path.join(fws.srcPath,'scss','_fws_spriteData.scss'),_spriteDataContent);
                            };
                        };
                    }); 
                };
            });
        };


        //svg精灵图生成
        if(imgs.svgList.length){
            let sprites = svgstore(),
                spriteDist = path.resolve(_ts.path,'..',dirName+'.svg');

            imgs.svgList.forEach((item,list)=>{
                let elementName = path.basename(item,path.extname(item));                

                sprites.add(elementName,fs.readFileSync(item,'utf8'));

            });
            fs.writeFileSync(spriteDist,sprites);
        };
    }
    getImgList(){
        const _ts = this;
        let imgs = {
            'pngList':[],
            'svgList':[]
        };
        if(pathInfo(_ts.path).type === 'dir'){
            let files = fs.readdirSync(_ts.path);
            
            files.forEach((item,index)=>{
                let type = item.substr(item.length - 4,4).toLowerCase();

                switch (type) {
                    case '.png':
                        imgs.pngList.push(path.join(_ts.path,item));
                    break;
                
                    case '.svg':
                        imgs.svgList.push(path.join(_ts.path,item));
                    break;
                };
            });
        }else{
            tip.error(_ts.path+'不是一个有效的目录')
        };
        return imgs;
    }

};



module.exports = outSprite;



