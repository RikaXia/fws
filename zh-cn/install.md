# 安装

FWS依赖于**node 7.6.0**或以上版本（需支持`async`语法）。



!> 国内网络环境建议安装`cnpm`（当然这不是必须的）。

```bash
npm install -g cnpm --registry=https://registry.npm.taobao.org
```

## 映射安装（推荐）

> 可能很多时候有需要对FWS进行扩展，所以不太建议在本地开发阶段将FWS安装到Node全局。
安装到平时习惯的工作目录，再映射到Node全局应该会来得舒坦些。

```bash
# 克隆项目到本地
git clone https://github.com/sbfkcel/fws.git

# 进入fws目录
cd fws

# 安装依赖（国内网络建议为`cnpm install`）
npm install

# 注册fws到全局
npm link

# 打印fws版本号，检查是否安装成功
fws -V
```

## npm安装
```bash
npm install -g fws      # 安装到全局环境
```

## 相关链接

[淘宝NPM镜像](http://npm.taobao.org/)
