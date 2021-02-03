const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const Post = require('./post');
const art = require('art-template');
const { copyFile, writeFile } = require('./writeFile');
const md = require('markdown-it')({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          hljs.highlight(lang, str, true).value
        }</code></pre>`;
      } catch (__) {}
    }

    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});
/**
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
  constructor(mdDir, pageConfig, templateConfig) {
    if (!mdDir) {
      throw new Error('create new Page need mdDir');
    }

    this.categories = {};
    this.tags = {};

    this.mdDir = mdDir;
    this.pageConfig = pageConfig;
  }

  // private
  _sliceMds(mdFiles) {
    const pageSize = this.pageConfig.pageSize;
    const slicedFiles = [];
    let slicingFiles = mdFiles;
    for (let i = 1; i <= Math.ceil(mdFiles.length / pageSize); i++) {
      slicedFiles.push(slicingFiles.slice(0, pageSize * i));
      slicingFiles = slicingFiles.slice(pageSize * i);
    }
    this.mdList = slicedFiles;
  }
  _loadMd() {
    const mdFiles = glob.sync('**/*.md', { cwd: this.mdDir });
    this._sliceMds(mdFiles);
  }
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
  _renderPostList(mds) {
    return mds.map((item) => {
      const post = new Post(this.mdDir, item);
      const { category, tags } = post.front;

      // 记录分类和标签
      this.categories[category]
        ? this.categories[category]++
        : (this.categories[category] = 1);

      tags.forEach((tag) => {
        this.tags[tag] ? this.tags[tag]++ : (this.tags[tag] = 1);
      });

      return post.renderItem(this.postItemTemplate);
    });
  }
  _renderSidebar() {
    const { sidebarConfig } = this.pageConfig;

    const getCountByName = {
      categories: Object.keys(this.categories).length,
      tags: Object.keys(this.tags).length,
      posts: this.postCount,
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
    const postLists = this.mdList.map((mds) => this._renderPostList(mds));
    const pageCount = postLists.length;
    this.postCount = postLists.flat().length;
    const sidebarData = this._renderSidebar();

    return postLists.map((postList, index) =>
      art.render(this.pageTemplate, {
        layout: this.layoutTemplate,
        title: this.pageConfig.title,
        author: this.pageConfig.author,
        description: this.pageConfig.description,
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
      })
    );
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
