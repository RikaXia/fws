'use strict';

/**
 * 精灵图生成
 * 
 * @class OutSprite
 * {
 *  srcDir:'',                  <string> 源文件路径
 *  distSpreiteDir:'',          [string] 精灵图输出目录
 *  distScssDir:''              [string] scss输出目录
 * }
 */
class OutSprite{
    constructor(option){
        const _ts = this;

        option = option || {};

        let m = _ts.m = {
                path:require('path'),
                fs:require('fs-extra'),
                spritesmith:require('spritesmith'),
                svgstore:require('svgstore'),
                pathInfo:require('./getPathInfo')
            },
            config = _ts.config = {};

        //配置写入到_ts.config
        for(let i in option){
            config[i] = option[i];
        };

        return new Promise((resolve,reject)=>{
            //检查目录是否存在
            if(m.pathInfo(config.srcDir).type === 'dir'){
                _ts.init().then(v => {

                }).catch(e => {

                });
            }else{
                reject({
                    status:'error',
                    msg:`${config.srcDir} 不是有效的目录`
                });
            };
        });



        
    }

    init(){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;
        
        let srcDirName = (()=>{
            let pathDirs = config.srcDir.split(m.path.sep);
            return pathDirs[pathDirs.length-1];
        })(),
        
        spriteTaskList = [],
        
        imgList = _ts.getImgList();


        //处理svg图片
        spriteTaskList.push(new Promise((resolve,reject)=>{
            //处理svg图片
            if(imgList.svg.length){
                let svgstore = m.svgstore(),
                    dist = m.path.join(config.distSpreiteDir,srcDirName+'.svg');
                
                //将svg图片添加到svgstore
                imgList.svg.forEach((item,index)=>{
                    let svgElementName = m.path.basename(item,m.path.extname(item));
                    svgstore.add(svgElementName,m.fs.readFileSync(item,'utf8'));
                });

                //写入文件
                try {
                    m.fs.writeFileSync(dist,svgstore);
                } catch (err) {
                    reject({
                        status:'error',
                        msg:err
                    });
                };
            }else{
                resolve({
                    status:'success',
                    msg:'目录无Svg图片要处理'
                });
            };
        }));

        //处理png精灵图片
        spriteTaskList.push(new Promise((resolve,reject)=>{
            if(imgList.png.length){
                
                //设置选项
                let option = {
                    src:imgList.png,                //png图片列表
                    padding:4,                      //图片间隙大小
                    algorithm:'binary-tree'         //图片对齐方式
                };

                //如果配置中有声明图像处理引擎，则传入引擎到配置中
                if(fws.config.imgEngine !== '' && typeof fws.config.imgEngine === 'string'){
                    option.engine = require(fws.config.imgEngine);
                };

                //生成png精灵图、sass文件、以及更新项目精灵图索引（sass）
                let pngMotor = (err,result)=>{
                    if(err){
                        reject({
                            status:'error',
                            msg:err
                        });
                    }else{
                        //精灵图数据、精灵图输出路径
                        let spriteData = {
                                size:{},
                                spriteNames:[],                    
                                element:{},
                                url:'',
                                path:''                            
                            },
                            spriteDist = m.path.join(config.distSpreiteDir,srcDirName+'.png');
                        
                        //保存精灵图
                        if(result.image){
                            try {
                                m.fs.writeFileSync(spriteDist,result.image);
                            } catch (err) {
                                reject({
                                    status:'error',
                                    msg:err
                                });
                            };
                        };

                    };
                };

                m.spritesmith.run(option,pngMotor);
            }else{
                resolve({
                    status:'success',
                    msg:'目录无Png图片要处理'
                });
            };
        }));


        //返回任务
        return new Promise.all(spriteTaskList);              
    }

    //获取图片列表
    getImgList(){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;
        
        let imgList = {
                'png':[],
                'svg':[]
            },
            files = m.fs.readdirSync(config.srcDir);
        
        files.forEach((item,index)=>{
            let type = item.substr(item.length - 4,4).toLowerCase(),
                filePath = m.path.join(config.srcDir,item);
            switch (type) {
                case '.png':
                    imgList.png.push(filePath);
                break;
            
                case '.svg':
                    imgList.svg.push(filePath);
                break;
            };
        });
        return imgList;        
    }

};

module.exports = OutSprite;



