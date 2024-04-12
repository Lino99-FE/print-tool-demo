# HIS系统的打印工具库
## 说明
  基于handlebars工具库实现的打印工具库，模板语法为mustache语法，支持if each 语法，具体可查看[handlebars官方文档](https://handlebarsjs.com/)

## 安装
推荐使用node V18及以上版本
推荐使用yarn安装
执行```yarn```或```npm install```

## 运行
执行```yarn dev```或```npm run dev```

## 构建
执行```yarn build```或```npm run build```

## 生成发布版本
### Windows
程序版本使用npm默认版本号(Semver)管理
分为patch、minor、major版本号
补丁版本构建执行```yarn build:patch```或```npm run build:patch```
功能版本构建执行```yarn build:minor```或```npm run build:minor```
框架版本构建执行```yarn build:major```或```npm run build:major```

### mac
暂不支持...

## 程序更新
程序集成electron-updater可以实现自动更新流程管控，执行对应的发布版本构建完成后，在release目录中会生成对应的版本号的文件夹。
将文件夹中的三个文件：latest.yml;固生堂桌面客户端-Windows-x.x.x-Setup.exe;固生堂桌面客户端-Windows-x.x.x-Setup.exe.blockmap
放置到oss中即可，oss地址：oss://gst-application/latest/
***Tips:*** *oss所属Bucket的ACL权限必须为公共可读！！！*