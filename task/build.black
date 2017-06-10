class Build{
    constructor(projectPath,options){
        const _ts = this;
        _ts.m = {
           fs:require('fs-extra'),
           path:require('path'),
           compile:require('../lib/compile'),
           tip:require('../lib/tip'),
           clean_css:require('clean-css'),
           UglifyJS:require('uglify-js'),
           Svgo:require('svgo'),
           imagemin:require('imagemin'),
           imagemin_pngquant:require('imagemin-pngquant'),
           imagemin_jpegtran:require('imagemin-jpegtran'),
           imagemin_jpegrecompress:require('imagemin-jpeg-recompress'),
           pathInfo:require('../lib/getPathInfo')
        };

        _ts.init();
    }

    //初始化
    init(){
        const _ts = this;

        //编译开发文件到dist目录
        let oSrcFiles = _ts.traversalDir(fws.srcPath);

        //编译方法
        let compile = (filePath)=>{
            new _ts.m.compile({
                src:filePath,
                debug:false,
                callback:(obj)=>{
                    //回调处理文件，压缩、autoprefixer添加签名等
                    if(obj.status === 'success' && obj.path){
                        _ts.compression(obj.path);
                    };
                }
            });
        };

        //处理编译
        for(let i in oSrcFiles){
            if(oSrcFiles[i].length){
                oSrcFiles[i].forEach((item,index)=>{
                    compile(item);
                });
            };
        };
    }
    
    //遍历目录
    traversalDir(dir){
        const _ts = this;
        let oFiles = {},
            eachDir;
        (eachDir = (dir)=>{
            let dirInfo = _ts.m.pathInfo(dir);
            if(dirInfo.type === 'dir'){
                let files = _ts.m.fs.readdirSync(dir);

                files.forEach((item,index)=>{
                    let filePath = _ts.m.path.join(dir,item),
                        itemInfo = _ts.m.pathInfo(filePath);
                    
                    if(itemInfo.type === 'dir'){
                        eachDir(filePath)
                    }else if(itemInfo.type === 'file'){
                        if(oFiles[itemInfo.extension] === undefined){
                            oFiles[itemInfo.extension] = [];
                        };
                        oFiles[itemInfo.extension].push(filePath);
                    };
                });
            };
        })(dir);

        return oFiles;
    }

    //压缩
    compression(filePath){
        const _ts = this;
        let fileInfo = _ts.m.pathInfo(filePath),
            fileContent = fileInfo.type === 'file' ? _ts.m.fs.readFileSync(filePath) : '';

        switch (fileInfo.extension) {
            case '.html':
                let html = _ts.compression_html(fileContent.toString());
                _ts.m.fs.writeFileSync(filePath,html);
                _ts.m.tip.success(filePath + '压缩完成');
            break;
            case '.css':
                let css = _ts.compression_css(fileContent.toString());
                _ts.m.fs.writeFileSync(filePath,css);
                _ts.m.tip.success(filePath + '压缩完成');
            break;
            case '.js':
                let js = _ts.compression_js(fileContent.toString());
                _ts.m.fs.writeFileSync(filePath,js);
                _ts.m.tip.success(filePath + '压缩完成');
            break;
            case '.svg':
                let svg = _ts.compression_svg(fileContent.toString());
                _ts.m.fs.writeFileSync(filePath,svg);
                _ts.m.tip.success(filePath + '压缩完成');
            break;
            case '.png':case '.jpg':case '.jpeg':
                _ts.compression_img(filePath);
            break;
            case '.ttf':

            break;
        }
    }

    //字体提取
    compression_font(){
        const _ts = this;
    }

    //压缩位图
    compression_img(path){
        const _ts = this;

        //原始图片大小
        let originalImg = _ts.m.fs.readFileSync(path).length,
            imgmini = (m,callback)=>{
                _ts.m.imagemin([path],'',{
                    plugins:[
                        _ts.m.imagemin_jpegrecompress({
                            quality:'low',
                            accurate:true,
                            method:m,
                            min:35,
                            max:60,
                            loops:0
                        }),
                        _ts.m.imagemin_pngquant({
                            nofs:true,
                            quality:'35-60'
                        })
                    ]
                }).then(file => {                    
                    if(typeof callback === 'function'){
                        callback(file);
                    };
                });
            };
        
        imgmini('ssim',(file)=>{
            let img = file[0].data;

            if(img.length < originalImg){
                _ts.m.fs.writeFileSync(path,img);
                _ts.m.tip.success(path + '压缩完成');
            }else{
                 imgmini('ms-ssim',(file)=>{
                    let img = file[0].data;

                    if(img.length < originalImg){
                        _ts.m.fs.writeFileSync(path,img);
                        _ts.m.tip.success(path + '深层压缩完成');
                    };
                });
            };
        });
        
    }

    //压缩svg
    compression_svg(content){
        const _ts = this;

        let svgo = new _ts.m.Svgo({}),
            svg;
        svgo.optimize(content,(result)=>{
            svg = result.data;
        });

        return svg;       
    }

    //压缩js
    compression_js(content){
        const _ts = this;

        let js = _ts.m.UglifyJS.minify(content,{
            fromString:true,
            mangle:{
                except:['$','require','exports']
            }
        });

        return _ts.signature('.js') + '\r\n'+js.code;
    }

    //压缩css
    compression_css(content){
        const _ts = this;
        let css = new _ts.m.clean_css({
            compatibility:'ie7'
        }).minify(content);

        return _ts.signature('.css') + '\r\n'+css.styles;
    }

    //压缩html
    compression_html(content){
        const _ts = this;
        let re = /<title>.*<\/title>/;
        let html = '',
            stitle = content.match(re);

        html = content.replace(re,stitle[0] + '\r\n    ' + _ts.signature('.html'));

        return html;

        //return _ts.signature('.html') + '\r\n'+content;
    }

    //文件签名
    signature(extension){
        const _ts = this;

        let createDate = new Date(fws.config.createTime),
            formatDate = (date)=>{
                return date.getFullYear()+'.'+(date.getMonth() + 1)+'.'+date.getDate()+' '+date.getHours()+':'+date.getMinutes();
            },
            sCreateDate = formatDate(createDate),       //项目创建时间
            sUpdateDate = formatDate(new Date()),       //项目更新时间
            sCreateAuthor = fws.config.author,
            sCreateMail = fws.config.mail,
            sUpateAuthor = fws.config.update_author,
            sUpateMail = fws.config.update_mail,
            sSignature = (()=>{
                //let s = `代号：${fws.config.projectName},  时间：${sCreateAuthor}(${sCreateMail}) ${sCreateDate},  更新：${sUpateAuthor}(${sUpateMail}) ${sUpdateDate}`;
                let s = `代号：${fws.config.projectName},  创建：${sCreateAuthor} ${sCreateDate},  更新：${sUpateAuthor} ${sUpdateDate}`;
                return s;
            })();
    
        let s = '';
        switch (extension) {
            case '.html':
                //s = `<!--${sSignature}-->`
                s = `<meta name="signature" content="${sSignature}">`
                //s = `<!--[if ${sSignature}]><![endif]-->`;
            break;
            case '.css':
            case '.js':
                s = `/*! ${sSignature} */`
            break;    
        };
        return s;
    }

};


module.exports = {
    regTask:{
        command:'[name]',
        description:'项目编译',
        option:[
            ['-s, --server','开启http server']
        ],
        help:()=>{
            console.log('   补充说明:');
            console.log('   ------------------------------------------------------------');
            console.log('   暂无');
        },
        action:Build
    }
};