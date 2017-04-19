'use strict';

/**
 * 获取数据类型
 * 
 * @param {any} obj 需要获取类型的数据
 * @returns {string} number|string|array|json|regExp
 */
let fun = (obj)=>{
    if(typeof obj === 'number'){
        return 'number';
    }else if(typeof obj === 'string'){
        return 'string';
    }else if(typeof obj === 'object'){
        if(Array.isArray(obj)){
            return 'array';
        }else if(Object.prototype.toString.call(obj).toLowerCase() == "[object object]"){
            return 'json';
        }else if(typeof obj.test === 'function'){
            return 'regExp';
        };
    };
};
module.exports = fun;