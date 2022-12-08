#!/usr/bin/env bash

# 安装brew
curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh

# 安装nginx
brew install nginx

# 新增nginx配置, **新增一个custom.conf关联到默认conf文件或者覆盖默认conf文件** TODO

# 下载静态资源, **下载路径与nginx配置静态路径一致**, 静态资源放置在google drive, 提供下载功能
curl -L -o ${path/filename} "https://drive.google.com/uc?export=download&id=1P2cX-OqRBi4Yezb7JcUiRKqidMl0Vcjs"