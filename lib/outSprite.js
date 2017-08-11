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
                console.log(this.getImgList());
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
        })();

        return new Promise((resolve,reject)=>{
            let imgList = _ts.getImgList();
            if(imgList.png.length === 0 && imgList.svg.length === 0){
                resolve({
                    status:'success',
                    msg:`${config.srcDir} 目录没有Png或Svg文件`
                });
            };

            //处理png图片
            if(imgList.png.length){

            };

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
                m.fs.writeFileSync(dist,svgstore);

            };
        });
                      
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



