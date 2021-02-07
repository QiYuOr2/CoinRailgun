const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const Post = require('./post');
const art = require('art-template');
const { copyFile, writeFile } = require('./writeFile');
/**
 * 页面类 /page/*
 * @description
 * 创建一个页面需要
 *  - 模板
 *    - 模板目录
 *  - 页面配置
 *    - 分页配置
 *    - 底部配置
 *    - 侧边栏配置
 *    - 页面基础信息配置
 *  - 内容
 *    - 文章列表或文章全文
 *    - 侧边栏或带有目录的侧边栏
 *    - 底部
 *  - 输出目录
 */
class Page {
  constructor(mdDir, pageConfig) {
    if (!mdDir) {
      throw new Error('create new Page need mdDir');
    }

    this.categories = {};
    this.tags = {};

    this.mdDir = mdDir;
    this.pageConfig = pageConfig;
  }

  // private
  // 分页
  _sliceList(postList) {
    const pageSize = this.pageConfig.pageSize;
    const slicedFiles = [];
    let slicingFiles = postList;
    for (let i = 1; i <= Math.ceil(postList.length / pageSize); i++) {
      slicedFiles.push(slicingFiles.slice(0, pageSize));
      slicingFiles = slicingFiles.slice(pageSize);
    }
    return slicedFiles;
  }
  //读取文章
  _loadMd() {
    const mdFiles = glob.sync('**/*.md', { cwd: this.mdDir });
    this.mdList = mdFiles.filter((item) => item !== 'about.md');
  }
  // 分页器
  _renderPagination(pageCount, current) {
    const pages = new Array(pageCount).fill(0).map((_item, index) => {
      return {
        key: index + 1,
        isCurrent: index + 1 === current,
        href: `/page/${index + 1}`,
      };
    });

    const prevPage = {
      key: '上一页',
      isCurrent: false,
      href: `/page/${current - 1}`,
      isPrev: true,
    };
    const nextPage = {
      key: '下一页',
      isCurrent: false,
      href: `/page/${current + 1}`,
      isNext: true,
    };

    if (pageCount === 1) {
      return pages;
    }

    if (current === 1) {
      return [...pages, nextPage];
    }
    if (current === pageCount) {
      return [prevPage, ...pages];
    }

    return [prevPage, ...pages, nextPage];
  }
  // 侧边栏统计
  _renderCategoryAndTag(md) {
    const post = new Post(this.mdDir, md);
    const { category, tags } = post.front;

    // 记录分类和标签
    this.categories[category]
      ? this.categories[category]++
      : (this.categories[category] = 1);

    tags?.forEach((tag) => {
      this.tags[tag] ? this.tags[tag]++ : (this.tags[tag] = 1);
    });
  }
  // 文章列表
  _renderPostList(sidebar, list) {
    const sortByTime = (a, b) => {
      return b.createTime.getTime() - a.createTime.getTime();
    };

    return list
      .map((item) => {
        const post = new Post(this.mdDir, item, this.pageConfig.outputDir);

        const postHtml = post
          .loadConfig(this.pageConfig)
          .loadTemplate({
            layoutTemplate: this.layoutTemplate,
            postTemplate: this.postTemplate,
            itemTemplate: this.postItemTemplate,
          })
          .loadSidebar({
            sidebarTemplate: this.sidebarTemplate,
            sidebarData: sidebar,
          })
          .loadFooter({
            footerTemplate: this.footerTemplate,
            footerData: this.pageConfig.footerConfig,
          })
          .build();
        return { postHtml, createTime: new Date(post.front.date) };
      })
      .sort(sortByTime);
  }
  // 侧边栏
  _renderSidebar() {
    const { sidebarConfig } = this.pageConfig;

    const getCountByName = {
      categories: Object.keys(this.categories).length,
      tags: Object.keys(this.tags).length,
      archives: this.postCount,
    };

    sidebarConfig.nav = sidebarConfig.nav.map((item) => ({
      label: item.label,
      url: item.url,
      count: getCountByName[item.name],
    }));
    return sidebarConfig;
  }
  _render() {
    this._loadMd();
    this.mdList.forEach((mds) => this._renderCategoryAndTag(mds));
    this.postCount = this.mdList.length;
    const sidebarData = this._renderSidebar();
    this.sidebarData = sidebarData;

    const postLists = this._sliceList(
      this._renderPostList(sidebarData, this.mdList)
    );
    const pageCount = postLists.length;

    return postLists.map((postList, index) => {
      return art.render(this.pageTemplate, {
        layout: this.layoutTemplate,
        title: this.pageConfig.title,
        author: this.pageConfig.author,
        description: this.pageConfig.description,
        codeTheme: this.pageConfig.codeTheme,
        postList: this.postListTemplate,
        postData: {
          posts: postList,
          pagination: this._renderPagination(pageCount, index + 1),
        },
        sidebar: this.sidebarTemplate,
        sidebarData,
        footer: this.footerTemplate,
        footerData: this.pageConfig.footerConfig,
        links: this.pageConfig.sidebarConfig.links,
      });
    });
  }

  _buildAssets() {
    copyFile(
      path.join(this.templateBaseDir, 'assets'),
      path.join(this.pageConfig.outputDir, 'assets')
    );
  }

  // public
  loadTemplate(templateConfig) {
    this.templateBaseDir = templateConfig.templateBaseDir;
    this.postItemTemplate = path.join(
      templateConfig.templateBaseDir,
      templateConfig.postItemTemplate
    );
    this.postListTemplate = path.join(
      templateConfig.templateBaseDir,
      templateConfig.postListTemplate
    );
    this.sidebarTemplate = path.join(
      templateConfig.templateBaseDir,
      templateConfig.sidebarTemplate
    );
    this.layoutTemplate = path.join(
      templateConfig.templateBaseDir,
      templateConfig.layoutTemplate
    );
    this.footerTemplate = path.join(
      templateConfig.templateBaseDir,
      templateConfig.footerTemplate
    );
    this.postTemplate = path.join(
      templateConfig.templateBaseDir,
      templateConfig.postTemplate
    );
    this.pageTemplate = fs.readFileSync(
      path.join(templateConfig.templateBaseDir, templateConfig.pageTemplate),
      'utf-8'
    );

    return this;
  }
  build() {
    const pagesHtml = this._render();
    this._buildAssets();
    pagesHtml.forEach((pageHtml, index) => {
      // 第一页时需要同时渲染index和page/1
      if (index === 0) {
        writeFile(path.join(this.pageConfig.outputDir, 'index.html'), pageHtml);
      }
      writeFile(
        path.join(this.pageConfig.outputDir, `page/${index + 1}`, 'index.html'),
        pageHtml
      );
    });
  }
}

module.exports = Page;
