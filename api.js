/// <reference path="./typings/index.d.ts" />
module.exports = {

    /**
     * sass转css
     * new Sass2css({
     *  src:'',
     *  dist:'',
     *  debug:false
     * })
     * .then(v => {//成功})
     * .catch(e => {//失败})
     */
    Sass2css:require('./lib/sass2css'),

    /**
     * ts、tsx、js、es、js6转为es5
     * new Ts2({
     *  src:'',
     *  dist:'',
     *  debug:false
     * })
     * .then(v => {//成功})
     * .catch(e => {//失败})
     */
    Ts2:require('./lib/ts2'),

    
    Pug2html:require('./lib/pug2html'),
        
    Jsx2js:require('./lib/jsx2js'),

    OutSprite:require('./lib/outSprite')
}