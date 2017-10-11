# 项目文件结构

FWS默认创建的项目目录结构大致如下:

```bash
项目目录名称
│  fws_config.js            # 项目配置文件
├─dev                       # 开发目录
├─dist                      # 生产目录
└─src                       # 源文件目录
    │  index.pug
    │  _header.pug          # 以'_'开始，则为pug公共文件
    ├─css
    │  │  style.scss
    │  │  _header.scss      # 以'_'开始，则为scss公共文件
    │  └─_fws
    ├─data                  # pug数据目录
    │      index.js         # 页面数据文件，与项目中的'index.pug'页面对应
    │      _public.js       # '_'公共数据文件
    ├─images
    │  │  logo.png
    │  └─_spritexxx         # 精灵图目录，以'_sprite'开始的目录则识别为精灵图目录
    │          a.png
    │          b.png
    ├─js                    # javascript目录
    │      main.es6
    │
    └─media                 # 多媒体资源目录
```
- `fws_config.js`为项目配置文件
- 所有的以'_'线开头的文件，则识别为同类型的公共文件。此类的文件不会被编译出独立的文件。
- 以'_sprite'开始的目录则识别为精灵图目录

## 命名空间
