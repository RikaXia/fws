# workspace


## 文件结构
```
workspace/
	|- config.js
	|- package.json						//工具依赖模块配置
	|- README.md						//工具介绍文档
	|- node_modules/					//所有的依赖模块
	|- lib/								//工具的各任务
	`- app/
		|- project/						//项目
		|	|- src/						//项目源文件目录，`watch`命令会监听目录下的文件变动
		|	|	|- jade/				//项目jade文件存放目录
		|	|	|	|- _module.jade		//共用的jade文件以`_`开头，不会直接编译
		|	|	|	`- index.jade
		|	|	|- data/				//项目数据文件存放目录，数据文件名与jade文件名相对应
		|	|	|	`- index.json
		|	|	|- sass/				//项目sass文件
		|	|	|	`- index.scss
		|	|	|- ts/					//项目typescript文件
		|	|	|	`- main.ts
		|	|	|- images/				//图片目录
		|	|	|	|- _sprite			//雪碧图目录
		|	|	|	|- icon.png
		|	|	|	`- module.psd		//`psd2jade --module`，会生成对应的`_module.jade`、`_module.scss`、`images/_module/`、`images/module.bj`文件
		|	|	`- media/				//媒体目录，用于存放音视频文件
		|	|
		|	|- dev/						//开发目录，由`build --dev`生成
		|	|	|- index.html
		|	|	|- css/
		|	|	|- images/
		|	|	| 	|- _sprite.png		//合并的雪碧图，但没有压缩
		|	|	|	`- icon.png			//直接将dev里复制过来
		|	|	`- js/
		|	|	
		|	`- dist/					//生产目录，由`build --dist`生成，不同于`build --dev`的是，该目录下的js、css、img都是压缩处理过的
		|		|- index.html
		|		|- css/
		|		|- images/
		|		`- js/
		|
		`- other project				//其它项目
```

web fe workspace