'use strict';

/**
 * 获取数据类型
 * 
 * @param {any} obj 需要获取类型的数据
 * @returns {string} number|string|array|date|object|boolean|regExp|function|null|undefined
 */
let fun = (obj)=>{
    let re = /^[A-Z]{1}/,
        typeList = [Number,String,Array,Date,Object,Boolean,RegExp,Function],
        sTypeList = ['number','string','array','date','object','boolean','regExp','function'],
        sType;

    try {
        let objType = obj.constructor;
        
        for(let i=0,len=typeList.length; i<len; i++){
            if(typeList[i] === objType){
                sType = sTypeList[i];
                break;
            };
        };

        // sType = obj.constructor === String;
        // console.log(sType)
        // sType = sType.replace(re,(word)=>{
        //     return word.toLowerCase();
        // });
        
    } catch (error) {
        sType = obj+''.toLowerCase();
    };

    return sType;
    
    // if(typeof obj === 'number'){
    //     return 'number';
    // }else if(typeof obj === 'string'){
    //     return 'string';
    // }else if(typeof obj === 'object'){
    //     if(Array.isArray(obj)){
    //         return 'array';
    //     }else if(Object.prototype.toString.call(obj).toLowerCase() == "[object object]"){
    //         return 'json';
    //     }else if(typeof obj.test === 'function'){
    //         return 'regExp';
    //     };
    // };
};
module.exports = fun;