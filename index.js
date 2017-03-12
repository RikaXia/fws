const sass = require('node-sass'),
    colors = require('colors'),         //https://www.npmjs.com/package/colors
    cp = require('copy'),
    path = require('path'),
    fs = require('fs'),
    dir = __dirname,
    imagemin = require('imagemin');

console.log(imagemin);

//定义日志输出样式
colors.setTheme({
    info:['green','underline'],
    error:'red'
});

console.log(`${dir}/a.scss`);

sass.render({
  file:`${dir}/a.scss`,             //sass文件
  sourceMap:true,                   //是否生成map
  outputStyle:'compressed',         //输出压缩选项
  outFile:`a.css`                   //map文件名，用于在css中指定map名
},function(err, result) {
    //编译遇到错误
    if(err){
        console.log('sass编译出现错误'.red);
        console.log('==========================='.red);
        console.log(`见：${err.file}，第${err.line}行。${err.message}`.red);
        console.log('==========================='.red);
        console.log(err);
    };

    //编译通过
    if(result){
        console.log(result);

        //生成css文件
        fs.writeFile('a.css',result.css,()=>{
            console.log('css创建完成');
        });

        //生成map文件
        fs.writeFile('a.css.map',result.map,()=>{
            console.log('map创建完成');
        });
    };
});