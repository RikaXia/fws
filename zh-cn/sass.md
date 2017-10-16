# Sass 扩展

FWS内置了一些sass函数和mixin。


## 函数


** `rem` REM单位转换 **

```scss
/**
 * REM单位转换
 * @param   {object} $size        <必填> 像素大小
 * @returns {string}              转换之后的rem，例如：0.5rem
 */
rem($size)
```


** `map-url` 获取精灵图路径 **

```scss
/**
 * 获取精灵图路径
 * @param   {object} $sprite      <必填> 精灵图名称对象
 * @param   {string} $addedPath   [选填] 精灵图的相对路径，默认'../'
 * @returns {string}              合并之后的精灵图路径。如：'../images/_spritexxx.png'
 */
map-url($sprite)
```


** `map-width` 获取精灵图总宽 **

```scss
/**
 * 获取精灵图总宽
 * @param   {object} $sprite      <必填> 精灵图名称对象
 * @returns {number}              精灵图宽度
 */
map-width($sprite)
```


** `map-height` 获取精灵图总高 **

```scss
/**
 * 获取精灵图总高
 * @param   {object} $sprite      <必填> 精灵图名称对象
 * @returns {number}              精灵图高度
 */
map-height($sprite)
```


** `sprite-list` 获取精灵图列表 **
```scss
/**
 * 获取精灵图列表
 * @param   {object} $sprite      <必填> 精灵图名称对象
 * @returns {object}              精灵图中所包含的元素名。如：a,b
 */
sprite-list($sprite)
```


** `sprite-width` 获取精灵元素宽 **
```scss
/**
 * 获取精灵元素宽
 * @param   {object} $sprite      <必填> 精灵图名称对象
 * @param   {object} $element     <必填> 精灵元素名。如：a
 * @returns {number}              精灵元素宽。如：64
 */
sprite-width($sprite,$element)
```


** `sprite-height` 获取精灵元素高 **
```scss
/**
 * 获取精灵元素高
 * @param   {object} $sprite      <必填> 精灵图名称对象
 * @param   {object} $element     <必填> 精灵元素名。如：a
 * @returns {number}              精灵元素高。如：64
 */
sprite-height($sprite,$element)
```


** `sprite-x` 获取精灵元素X坐标 **
```scss
/**
 * 获取精灵元素X坐标
 * @param   {object} $sprite      <必填> 精灵图名称对象
 * @param   {object} $element     <必填> 精灵元素名。如：a
 * @returns {number}              精灵元素水平起始坐标。如：128
 */
sprite-x($sprite,$element)
```


** `sprite-y` 获取精灵元素Y坐标 **
```scss
/**
 * 获取精灵元素Y坐标
 * @param   {object} $sprite      <必填> 精灵图名称对象
 * @param   {object} $element     <必填> 精灵元素名。如：a
 * @returns {number}              精灵元素水平起始坐标。如：128
 */
sprite-y($sprite,$element)
```

## Mixin

** 输出精灵元素大小 **
```scss
/**
 * 输出精灵元素大小
 * @param   {object} $sprite      <必填> 精灵图名称对象
 * @param   {object} $element     <必填> 精灵元素名。如：a
 */
@include sprite-size($sprite,$element);
```

示例结果：
```css
width:64px; height:64px;
```

** 输出精灵元素背景坐标 **
```scss
/**
 * 输出精灵元素背景坐标
 * @param   {object} $sprite      <必填> 精灵图名称对象
 * @param   {object} $element     <必填> 精灵元素名。如：a
 */
@include sprite-position($sprite,$element);
```

示例结果：
```css
background-position:-128px -128px;
```

** 输出精灵图背景图像 **
```scss
/**
 * 输出精灵图背景图像
 * @param   {object} $sprite      <必填> 精灵图名称对象
 * @param   {string} $addedPath   [选填] 精灵图的相对路径，默认'../'
 */
@include sprite-url($sprite,$addedPath);
```

示例结果：
```css
background-image:url('../images/_spritexxx.png');
```


** 自定义字体 **
```scss
/**
 * 用于快速定义css webFont
 * @param   {string} $fontName    <必填> 字体名称，例如“hello.ttf”，则为“hello”
 * @param   {string} $addedPath   [选填] 字体相对路径，默认'../images/'
 */
@include font-face($fontName,$addedPath);
```

示例结果：
```css
background-image:url('../images/_spritexxx.png');
```
