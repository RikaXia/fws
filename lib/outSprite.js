'use strict';
const path = require('path');

const fs = require('fs-extra');
const spritesmith = require('spritesmith');

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
        
        let imgsPath = _ts.getImgList();
        if(imgsPath.length){
            spritesmith.run({
                src:imgsPath,
                padding:4,
                algorithm:'binary-tree',
                //engine:require('canvassmith')
            },(err,result)=>{
                if(err){
                    tip.error(err);
                }else{
                    //精灵数据
                    let spriteData = {
                            size:{},                        
                            element:{},
                            url:'',
                            path:''
                        },
                        dirName = (()=>{
                            let pathDirs = _ts.path.split(path.sep);
                            return pathDirs[pathDirs.length-1];
                        })(),
                        spriteDist = path.resolve(_ts.path,'..',dirName+'.png');
                    
                    //保存精灵图
                    fs.writeFileSync(spriteDist,result.image);

                    //精灵图url
                    spriteData.url = (()=>{
                        let surl = spriteDist.replace(fws.srcPath,''),
                            sPath = '..';
                        surl = surl.split(path.sep);
                        surl.forEach((item,index)=>{
                            if(item !== ''){
                                sPath += '/'+item;
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
                            spriteData.element[fileName] = result.coordinates[i];
                        };
                    };

                    //精灵图大小
                    if(result.properties){
                        spriteData.size.width = result.properties.width;
                        spriteData.size.height = result.properties.height;
                    };

                    let sSpriteData = JSON.stringify(spriteData,null,2);

                    sSpriteData = sSpriteData.replace(/{/g,'(');
                    sSpriteData = sSpriteData.replace(/}/g,')');

                    sSpriteData = '$dirName:'+sSpriteData;

                    console.log(sSpriteData);

                    
                    //console.log(spriteData);
                    // console.log(result.properties);
                };
            });
        }        
    }
    getImgList(){
        const _ts = this;
        let pngs;
        if(pathInfo(_ts.path).type === 'dir'){
            let imgs = fs.readdirSync(_ts.path);
                pngs = [];
            
            imgs.forEach((item,index)=>{
                if(item.substr(item.length - 4,4) === '.png'){
                    pngs.push(path.join(_ts.path,item));
                };
            });
        }else{
            pngs = undefined;
            tip.error(_ts.path+'不是一个有效的目录')
        };
        return pngs;
    }

};



module.exports = outSprite;



