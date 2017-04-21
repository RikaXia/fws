'use strict';

/**
 * 获取数据类型
 * 
 * @param {any} obj 需要获取类型的数据
 * @returns {string} number|string|array|date|object|boolean|regExp|function|null|undefined
 */
let fun = (obj)=>{
    let sType;
        //re = /^[A-Z]{1}/;

    try {
        let objType = obj.constructor.name;
        sType = objType.substr(0,1).toLowerCase() + objType.substr(1);
        //sType = objType.replace(re,objType.match(re)[0].toLowerCase());
        // sType = objType.replace(re,(word)=>{
        //     return word.toLowerCase();
        // });
    } catch (err) {
        sType = obj+''.toLowerCase();
    };
    return sType;
};

// console.time('计时');
// for(let i=0,len=900000; i<len; i++){
//     fun('String');
// };
// console.timeEnd('计时');
module.exports = fun;