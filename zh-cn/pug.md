# Pug 编译策略

通常Pug被用于后端渲染。但其实在前端重构阶段使用也能弥补手写html带来的诸多诟病。

** 譬如： **

- 让页面更规范
- 减少手写冗余内容
- ...

FWS让页面自动对应数据，如果项目页面较多，一些公共的模块在重构阶段就能够被很好地重用。

## 示例

```bash
项目目录
│  fws_config.js            # 项目配置文件
└─src                       # 源文件目录
    │  index.pug
    │  _header.pug          # 以'_'开始，则为pug公共文件
    └─data                  # pug数据目录
            index.js         # 页面数据文件，与项目中的'index.pug'页面对应
            _public.js       # '_'公共数据文件

```

** src/index.pug **
```pug
```

** src/_header.pug **
```pug
```

** src/data/index.js **

```javascript

```

** src/data/_public.js **

```javascript

```

** 编译结果 dist/index.html **

```html

```


