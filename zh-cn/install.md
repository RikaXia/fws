# 安装

FWS需要**node 7.6.0**或以上版本（需要支持`async`语法）。

## 安装cnpm

国内网络环境建议安装`cnpm`（当然这不是必须的）。

```bash
npm install -g cnpm --registry=https://registry.npm.taobao.org
```

## 映射安装（推荐）

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
