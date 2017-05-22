'use strict';
/**
 * {}
 * 
 * @class autoRefresh
 * {
 *  type:refresh、updateCss、updateJs、updateReact、updateImg
 *  listenPort:3000
 * }
 */
class autoRefresh{
    constructor(option){
        const _ts = this;
        _ts.m = {
            path:require('path'),
            fs:require('fs-extra'),
            Koa:require('koa'),
            Io:require('koa-socket'),
            _static:require('koa-static'),
            Router:require('koa-router')
        };
        
        option = option || {};

        for(let i in option){
            _ts[i] = option[i];
        };

        _ts.listenPort = typeof _ts.listenPort === 'number' ? _ts.listenPort : fws.config.listenPort ? fws.config.listenPort : 3000;

        _ts.app = new _ts.m.Koa();
        _ts.io = new _ts.m.Io();
        _ts.router = new _ts.m.Router();
        
        _ts.init();
    }
    init(type){
        const _ts = this;
        //_ts.app.use(_ts.m._static(_ts.m.path.join(fws.fwsPath,'staticfile')));
        
        //_ts.app.use(_ts.m._static(_ts.m.path.join(fws.cmdPath,'staticfile')));
        //_ts.app.use(_ts.m._static(_ts.m.path.join(fws.fwsPath)));
        
        // _ts.m.router.get('/',(ctx,next)=>{
        //     let content = _ts.m.fs.readFileSync(_ts.m.path.join(fws.fwsPath,'staticfile','index.html')).toString();
        //     ctx.body = content;
        // });

        //静态页面到
        _ts.app.use(_ts.m._static(_ts.m.path.join(fws.fwsPath,'welcome')));

        //当前项目
        _ts.app.use(_ts.m._static(_ts.m.path.join(fws.cmdPath)));

        _ts.io.attach(_ts.app);
        _ts.io.on('connection',(ctx,data) => {
            console.log('浏览器连接了');
        });

        // setInterval(function(){
        //     //广播
        //     _ts.io.broadcast('news',111);
        // },1000);
        
        // _ts.io.on('my other event',(ctx,data)=>{
        //     console.log(data);
        // });

        _ts.app
            .use(_ts.router.routes())
            .use(_ts.router.allowedMethods());
        
        _ts.app.listen(_ts.listenPort);
    }
};

module.exports = autoRefresh;