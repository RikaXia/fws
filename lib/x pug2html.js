'use strict';
/**
 * pug文件编译成为html
 * 
 * @class Pug2html
 * {
 *  src:'',                 pug文件路径
 *  dist:'',                html输出路径
 *  data:'',                页面数据
 *  debug:true,             debug模式将美化html，且可开启监听服务
 *  callback:()=>{}         回调
 * }
 */
class Pug2html{
    constructor(option){
        const _ts = this;
        _ts.m = {
            path:require('path'),
            fs:require('fs-extra'),
            pug:require('pug'),
            pathInfo:require('./getPathInfo'),
            tip:require('./tip')
        };

        option = option || {};

        for(let i in option){
            _ts[i] = option[i];
        };
        _ts.data = _ts.data === undefined ? {} : _ts.data;
        _ts.debug = _ts.debug === undefined ? true : _ts.debug;

        if(_ts.m.pathInfo(_ts.src).extension === '.pug'){
            try {
                _ts.init();
            } catch (error) {
                _ts.m.tip.error(error);
            };            
        }else{
            _ts.m.tip.error(_ts.src + ' 不是有效的pug文件');
        };
        
    }
    init(){
        const _ts = this;

        let fn = _ts.m.pug.compileFile(_ts.src,{
                doctype:'html',
                pretty:true
            }),
            html = fn(_ts.data);

        if(_ts.debug){
            html += '\r\n<!--fws开发模式start-->';
            html += '\r\n<script src="/staticfile/socket.io/1.7.3/socket.io.js"></script>';
            html += '\r\n<script src="/main.js"></script>';
            html += '\r\n<!--fws开发模式end-->';
        };

        _ts.m.fs.ensureDir(_ts.m.path.dirname(_ts.dist),(err)=>{
            if(err){
                _ts.m.tip.error(err);
                if(typeof _ts.callback === 'function'){
                    _ts.callback({
                        status:'success',
                        path:_ts.dist
                    });
                };
            }else{
                _ts.m.fs.writeFileSync(_ts.dist,html);
                _ts.m.tip.success(_ts.dist + ' 写入成功');

                if(typeof _ts.callback === 'function'){
                    _ts.callback({
                        status:'success',
                        path:_ts.dist
                    });
                };
            };
        });  
    }
};

module.exports = Pug2html;