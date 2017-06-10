let fn1 = function(value){
    return value;
};

或

let fn1 = (value)=>{
    return value;
};

或

let fn1 = value => value;


====================================


let fn2 = function(value){
    console.log(value);
};

或

let fn2 = (value)=>{
    console.log(value);
};

或

let fn2 = value => console.log(value);




/*
Promise笔记

状态:

状态有以下三种。
状态一经改变，任何时间都将是该结果。
任何其它操作都无法改变状态本身。

Pending         进行中
Resolved        已完成
Rejected        失败
*/

//声明一个promise对象
// let promise = new Promise((resolve,reject)=>{
//     if(true){
//         resolve('操作成功');
//     }else{
//         reject('操作失败');
//     };
// });

//使用promise对象，第二个参数方法可省略
// promise.then((value)=>{
//     //成功
//     console.log(value);
// },(error)=>{
//     //失败
//     console.log(error);
// });

//使用promise对象，等同于上
// promise
//     .then(value => console.log(value))
//     .catch(error => console.log(error))

// promise
//     .then((value)=>{
//         console.log('操作成功')
//         return value;
//     })
//     .then(value => console.log(value+1))
//     .catch((error)=>{
//         //能捕获这前所有then抛出的错误
//         console.log(error);
//     })

// //示例二

// function timeout(ms) {
//   return new Promise((resolve, reject) => {
//     setTimeout(resolve, ms, '传入的值');
//   });
// }

// timeout(100).then((value) => {
//   console.log(value);
// });

//声明一组Promise对象
// var promises = [11, 12, 12.5, 12.6, 11, 13].map(function (id) {
//     return new Promise((resolve,reject)=>{
//         if(id > 10){
//             resolve(id);
//         }else{
//             reject(id);
//         };
//     });
// });


// Promise.all(promises).then(function (posts) {
//     //当该组Promise对象状态都为fulfilled时则执行
//     console.log('正确执行',posts);
// }).catch(function(reason){
//     //当该组Promise对象其中有一个状态为失败时，此时reason值则由该对象reject抛出
//     console.log('捕获错误',reason);
// });

////*如果作为参数的Promise有定义自己的catch且返回的状态为Rejected，Promise.all的catch则不会执行。例如：


// const p1 = new Promise((resolve, reject) => {
//   resolve('hello');
// })
// .then(result => result)
// .catch((error)=>{
//     return error;
// });

// const p2 = new Promise((resolve, reject) => {
//   throw new Error('报错了');
// })
// .then(result => result)
// .catch((error)=>{
//     return error;
// });

// Promise.all([p1, p2])
// .then(result => console.log(result))
// .catch((error)=>{
//     console.log('all',error);
// });

// var promises = [15, 14, 12.5, 12.6, 11, 13].map(function (id) {
//     return new Promise((resolve,reject)=>{
//         // setTimeout(function(){
//         //     reject(id);
//         // },id);
//         setTimeout(function(){
//             resolve(id);
//         },id);
//     });
// });

// //将多个Promise包装成一个新的Promise实例，与Promise.all不同的是，只要promises中有一个实例第一个改变状态，p的状态就会跟着改变
// var p = Promise.race(promises);

// p.then(function(v){
//     console.log('正确',v)
// }).catch(function(e){
//     console.log('出错',e)
// })

let b = function(v){
    
    if(false){
        return v;
    }else{
        throw new Error('出去')
    }
}

//将对象转换为一个Promise对象
let a = Promise.resolve(b(222))

a.then((v)=>{
    console.log(v)
}).catch(function(e){
    console.log(e)
});