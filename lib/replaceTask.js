/**
 * 文件关键字替换
 * @memberOf Watch
 */
module.exports = (option)=>{

    const {fs,path,pathInfo} = {
        fs:require('fs-extra'),
        path:require('path'),
        pathInfo:require('./getPathInfo')
    };
    
    let src = option.src,
        dist = option.dist,
        rule = option.rule,
        fileInfo = pathInfo(src),
        distDir = path.dirname(src);

    return new Promise((resolve,reject)=>{
        //如果不是有效的文件，返回失败
        if(fileInfo.type !== 'file'){
            reject({
                status:'error',
                msg:`文件不存在 ${src}`
            });
        };

        let fileContent = fs.readFileSync(src).toString();

        rule.forEach(item => {
            let find = item.find,
                replace = item.replace;

            //如果传入的查询关键是是字符串，则转换为正则。否则还是使用正则
            if(typeof find === 'string'){
                find = new RegExp(find,'g');
            };

            fileContent = fileContent.replace(find,replace);

            fs.ensureDir(distDir,err => {
                if(err){
                    reject({
                        status:'error',
                        msg:`${distDir} 创建错误`,
                        info:err
                    });
                }else{
                    try {
                        fs.writeFileSync(dist,fileContent);
                        resolve({
                            status:'success',
                            msg:`写入 ${dist}`,
                            distPath:dist,
                            data:fileContent
                        });
                    } catch (error) {
                        reject({
                            status:'error',
                            msg:`写入失败 ${dist}`,
                            distPath:dist,
                            info:error
                        });
                    };
                };
            });
        });
    });
}