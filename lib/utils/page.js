const _ = require('ramda');
const glob = require('glob');
const Post = require('./post');
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

    this.templateBaseDir = templateConfig.templateBaseDir;
    this.postItemTemplate = templateConfig.postItemTemplate;
    this.postListTemplate = templateConfig.postListTemplate;
    this.sidebarTemplate = templateConfig.sidebarTemplate;
    this.pageTemplate = templateConfig.pageTemplate;

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
    const pages = new Array(pageCount).map((_item, index) => ({
      key: index + 1,
      isCurrent: index + 1 === current,
      href: `/page/${index + 1}`,
    }));

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

    if (length === 1) {
      return pages;
    }

    if (current === 1) {
      return [...pages, nextPage];
    }
    if (current === length) {
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
        : (this.categories[category] = 0);

      tags.forEach((tag) => {
        this.tags[tag] ? this.tags[tag]++ : (this.tags[tag] = 0);
      });

      return post.renderItem({
        templateBaseDir: this.templateBaseDir,
        templateDir: this.postItemTemplate,
      });
    });
  }
  _renderSidebar() {
    const { sidebarConfig } = this.pageConfig;
  }
  _render() {
    this._loadMd();
    const postLists = this.mdList.map((mds) => this._renderPostList(mds));
    const pageListHtml = postLists.map((postLists, index) => {});
  }

  // public
  loadTemplate(templateConfig) {
    return this;
  }
  build() {
    this._render();
  }
}

module.exports = Page;
