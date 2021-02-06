const path = require('path');
const Page = require('./page');
const Post = require('./post');
const art = require('art-template');
const fs = require('fs-extra');
const { writeFile } = require('./writeFile');
const dayjs = require('dayjs');

class CustomPage extends Page {
  constructor(mdDir, pageConfig) {
    super(mdDir, pageConfig);
  }

  _loadArchives() {
    const mdList = this.mdList
      .map((item) => {
        const post = new Post(this.mdDir, item);
        const date = new Date(post.front.date);

        return {
          label: post.front.title,
          url: `/categories/${post.front.category}/${post.front.name.replace(
            '.md',
            ''
          )}`,
          createTime: date,
          year: dayjs(date).format('YYYY'),
          month: dayjs(date).format('MM'),
          day: dayjs(date).format('DD'),
        };
      })
      .sort((a, b) => b.createTime.getTime() - a.createTime.getTime());
    return mdList;
  }

  _loadCategories() {
    const mdList = this.mdList
      .map((item) => {
        const post = new Post(this.mdDir, item);

        return {
          label: post.front.title,
          url: `/categories/${post.front.category}/${post.front.name.replace(
            '.md',
            ''
          )}`,
          createTime: new Date(post.front.date),
          category: post.front.category,
          date: post.front.date.slice(0, post.front.date.indexOf(' ')),
        };
      })
      .sort((a, b) => b.createTime.getTime() - a.createTime.getTime());
    return mdList;
  }

  _loadTags() {
    const mdList = this.mdList
      .map((item) => {
        const post = new Post(this.mdDir, item);

        return {
          label: post.front.title,
          url: `/categories/${post.front.category}/${post.front.name.replace(
            '.md',
            ''
          )}`,
          createTime: new Date(post.front.date),
          tag: post.front.tags?.join(','),
          date: post.front.date.slice(0, post.front.date.indexOf(' ')),
        };
      })
      .sort((a, b) => b.createTime.getTime() - a.createTime.getTime());
    return mdList;
  }

  _loadAbout() {}

  _render() {
    this._loadMd();
    const customTemplate = fs.readFileSync(this.customTemplate, 'utf-8');
    switch (this.pageConfig.name) {
      case 'archives':
        return art.render(customTemplate, {
          layout: this.layoutTemplate,
          title: this.pageConfig.title,
          author: this.pageConfig.author,
          description: this.pageConfig.description,
          codeTheme: this.pageConfig.codeTheme,
          sidebar: this.sidebarTemplate,
          sidebarData: this.sidebarData,
          footer: this.footerTemplate,
          footerData: this.pageConfig.footerConfig,
          links: this.pageConfig.sidebarConfig.links,
          postList: this._loadArchives(),
        });
      case 'categories':
        const categoryList = Object.keys(this.categoriesData).map((item) => ({
          label: item,
          count: this.categoriesData[item],
        }));

        return art.render(customTemplate, {
          layout: this.layoutTemplate,
          title: this.pageConfig.title,
          author: this.pageConfig.author,
          description: this.pageConfig.description,
          codeTheme: this.pageConfig.codeTheme,
          sidebar: this.sidebarTemplate,
          sidebarData: this.sidebarData,
          footer: this.footerTemplate,
          footerData: this.pageConfig.footerConfig,
          links: this.pageConfig.sidebarConfig.links,
          postList: this._loadCategories(),
          categoryList,
        });
      case 'tags':
        const tagList = Object.keys(this.tagsData).map((item) => ({
          label: item,
          count: this.categoriesData[item],
        }));

        return art.render(customTemplate, {
          layout: this.layoutTemplate,
          title: this.pageConfig.title,
          author: this.pageConfig.author,
          description: this.pageConfig.description,
          codeTheme: this.pageConfig.codeTheme,
          sidebar: this.sidebarTemplate,
          sidebarData: this.sidebarData,
          footer: this.footerTemplate,
          footerData: this.pageConfig.footerConfig,
          links: this.pageConfig.sidebarConfig.links,
          postList: this._loadTags(),
          tagList,
        });

      case 'about':
        const post = new Post(this.mdDir, 'about.md');

        const postHtml = post
          .loadConfig({ codeTheme: this.pageConfig.codeTheme })
          .loadTemplate(
            {
              layoutTemplate: this.layoutTemplate,
              postTemplate: this.customTemplate,
            },
            false
          )
          .loadSidebar({
            sidebarTemplate: this.sidebarTemplate,
            sidebarData: this.sidebarData,
          })
          .loadFooter({
            footerTemplate: this.footerTemplate,
            footerData: this.pageConfig.footerConfig,
          })
          .render();

        return postHtml;
      default:
        throw new Error('尚未完成加载其他自定义页的功能');
    }
  }

  loadTemplate(templateConfig) {
    this.templateBaseDir = templateConfig.templateBaseDir;
    this.sidebarData = templateConfig.sidebarData;
    this.categoriesData = templateConfig.categoriesData;
    this.tagsData = templateConfig.tagsData;
    this.customTemplate = path.join(
      templateConfig.templateBaseDir,
      templateConfig.customTemplate
    );
    this.layoutTemplate = path.join(
      templateConfig.templateBaseDir,
      templateConfig.layoutTemplate
    );
    this.sidebarTemplate = path.join(
      templateConfig.templateBaseDir,
      templateConfig.sidebarTemplate
    );
    this.footerTemplate = path.join(
      templateConfig.templateBaseDir,
      templateConfig.footerTemplate
    );
    return this;
  }

  build() {
    const html = this._render() || '';
    writeFile(
      path.join(this.pageConfig.outputDir, this.pageConfig.name, 'index.html'),
      html
    );
  }
}

module.exports = CustomPage;
