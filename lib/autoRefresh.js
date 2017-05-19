'use strict';
const path = require('path');
const fs = require('fs-extra');

// const pathInfo = require('./getPathInfo');
// const tip = require('./tip');

const Koa = require('koa');
const Io = require('koa-socket');
const _static = require('koa-static');
const Router = require('koa-router');

let app = new Koa();
let io = new Io();
let router = new Router();

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
        
        option = option || {};

        for(let i in option){
            _ts[i] = option[i];
        };

        _ts.listenPort = fws.config.listenPort;

        _ts.listenPort = typeof _ts.listenPort === 'number' ? _ts.listenPort : 3000;

        _ts.io = io;
        
        _ts.init();
    }
    init(type){
        const _ts = this;
        //app.use(_static(path.join(fws.fwsPath,'staticfile')));
        
        //app.use(_static(path.join(fws.cmdPath,'staticfile')));
        //app.use(_static(path.join(fws.fwsPath)));
        
        // router.get('/',(ctx,next)=>{
        //     let content = fs.readFileSync(path.join(fws.fwsPath,'staticfile','index.html')).toString();
        //     ctx.body = content;
        // });

        //静态页面到
        app.use(_static(path.join(fws.fwsPath,'welcome')));

        //当前项目
        app.use(_static(path.join(fws.cmdPath)));

        io.attach(app);
        io.on('connection',(ctx,data) => {
            console.log('连接了');
        });
        app
            .use(router.routes())
            .use(router.allowedMethods());
        app.listen(_ts.listenPort);
    }
};

module.exports = autoRefresh;