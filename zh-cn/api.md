# API

FWS目前提供了文件编译及压缩的接口。可根据团队需要自定义任务模块或进行二次开发。

也可部署在集成服务器来处理项目发布策略，又或是用于优化业务中的某些功能。


## 如何使用


```javascript
//引入FWS
const fws = require('fws');
```

### 图片压缩
```javascript
let imgCompile = new fws.compileImg({

});

imgCompile.then(r => {
    //编译成功
    console.log(r);
}).catch(e => {
    //编译失败
    console.log(e);
});
```

### js文件压缩
```javascript
let jsCompile = new fws.compileJs({

});

jsCompile.then(r => {
    //编译成功
    console.log(r);
}).catch(e => {
    //编译失败
    console.log(e);
});
```

### css文件压缩
```javascript
let cssCompile = new fws.compileCss({

});

cssCompile.then(r => {
    //编译成功
    console.log(r);
}).catch(e => {
    //编译失败
    console.log(e);
});
```

<!-- ### html文件压缩
```javascript
    let htmlCompile = new fws.compileHtml({

    });

    htmlCompile.then(r => {
        //编译成功
        console.log(r);
    }).catch(e => {
        //编译失败
        console.log(e);
    });
``` -->

### 文件拷贝
```javascript
let copy = new fws.Copy({

});

copy.then(r => {
    //编译成功
    console.log(r);
}).catch(e => {
    //编译失败
    console.log(e);
});
```

### sass文件编译：
```javascript
let sassCompile = new fws.Sass2css({

});

sassCompile.then(r => {
    //编译成功
    console.log(r);
}).catch(e => {
    //编译失败
    console.log(e);
});
```

### ts、tsx、jsx、es、es6文件编译
```javascript
let esCompile = new fws.Es2({

});

esCompile.then(r => {
    //编译成功
    console.log(r);
}).catch(e => {
    //编译失败
    console.log(e);
});
```

### Pug文件编译
```javascript
let pugCompile = new fws.Pug2html({

});

pugCompile.then(r => {
    //编译成功
    console.log(r);
}).catch(e => {
    //编译失败
    console.log(e);
});
```

### 精灵图合并
```javascript
let sprite = new fws.OutSprite({

});

sprite.then(r => {
    //编译成功
    console.log(r);
}).catch(e => {
    //编译失败
    console.log(e);
});
```

<!-- ### html签名添加
```javascript
    let htmlCompile = new fws.html2html({

    });

    htmlCompile.then(r => {
        //编译成功
        console.log(r);
    }).catch(e => {
        //编译失败
        console.log(e);
    });
``` -->