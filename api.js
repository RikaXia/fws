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
    Sass2css:require('./lib/Sass2css'),

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
    Ts2:require('./lib/Ts2'),

    Pug2html:require('./lib/Pug2html')
}