# CoinRailgun

![CoinRailgun Logo](https://cdn.jsdelivr.net/gh/Tuzilow/blog-image/img/crnlogo.png)

一个基于nodejs的静态博客生成器


## 快速开始

**安装 CoinRailgun**

```bash
npm install -g coinrailgun
```

**初始化博客**

```bash
crn init blog
cd blog
```

**创建新的文章**

```bash
crn new "Hello CRN"
```

**生成静态文件**

```bash
crn build
```

**本地运行网站**

```bash
crn server
```

## 配置项

> 执行`crn init`后生成的`site.config.json`中会有下方为展示出来的配置项，那些配置项暂时未无用配置

```json
{
  "basic": {
    "icon": "",
    "avatar": "https://cdn.jsdelivr.net/gh/Tuzilow/Tuzilow.github.io/images/avatar.png",
    "title": "Tuzilow的小站",
    "author": "Tuzilow",
    "description": "想要成为大佬",
    "keywords": [
      "Tuzilow",
      "鳕鱼堡",
      "前端",
      "JavaScript",
      "TypeScript",
      "nodejs",
      "后端",
      "编程"
    ]
  },
  "theme": {
    "name": "default", // 主题 目前只有default
    "highlight": "github-gist",
    "pageSize": 7, // 每页显示几条文章
    "friends": [ // 友情链接
      {
        "name": "BAR团队",
        "avatar": "http://www.barteam.cn/static/logo.jpg",
        "url": "http://www.barteam.cn/"
      }
    ],
    "about": { // “关于我” 页面  目前本项目的可扩展性很低，不建议修改
      "label": "about me.",
      "url": "/about"
    },
    "nav": [ // 导航栏  如果修改如下内容，需要自定与name相同的{name}.art模板，目前本项目的可扩展性很低，不建议作此操作
      {
        "name": "archives",
        "label": "归档",
        "url": "/archives"
      },
      {
        "name": "categories",
        "label": "分类",
        "url": "/categories"
      },
      {
        "name": "tags",
        "label": "标签",
        "url": "/tags"
      }
    ],
    "links": [ // 社交链接
      {
        "label": "fa-github-alt",
        "url": "https://github.com/Tuzilow"
      },
      {
        "label": "fa-qq",
        "url": "tencent://message/?uin=1176281967"
      }
    ],
    "footer": { // 版权和备案信息
      "beian": "",
      "copyright": {
        "year": "2019-2021"
      }
    }
  },
  "dev_server": { // 本地运行端口
    "port": 3000
  }
}
```