const fs = require('fs-extra');
const path = require('path');
const fm = require('front-matter');
const art = require('art-template');
const { writeFile } = require('./writeFile');
const hljs = require('highlight.js');
const uslug = require('uslug');
const md = require('markdown-it')({
  highlight: function (str, lang) {
    // 当前时间加随机数生成唯一的id标识
    const codeIndex =
      parseInt(Date.now()) + Math.floor(Math.random() * 10000000);
    // 复制功能主要使用的是 clipboard.js
    let html = `<button class="copy-btn" type="button" data-clipboard-action="copy" data-clipboard-target="#copy${codeIndex}">复制</button>`;
    const linesLength = str.split(/\n/).length - 1;
    // 生成行号
    let linesNum = '<span aria-hidden="true" class="line-numbers-rows">';
    for (let index = 0; index < linesLength; index++) {
      linesNum = linesNum + '<span></span>';
    }
    linesNum += '</span>';
    if (lang && hljs.getLanguage(lang)) {
      try {
        // highlight.js 高亮代码
        const preCode = hljs.highlight(lang, str, true).value;
        html = html + preCode;
        if (linesLength) {
          html += '<b class="name">' + lang + '</b>';
        }
        // 将代码包裹在 textarea 中，由于防止textarea渲染出现问题，这里将 "<" 用 "&lt;" 代替，不影响复制功能
        return `<pre class="hljs"><code>${html}</code>${linesNum}</pre><textarea style="position: absolute;top: -9999px;left: -9999px;z-index: -9999;" id="copy${codeIndex}">${str.replace(
          /<\/textarea>/g,
          '&lt;/textarea>'
        )}</textarea>`;
      } catch (error) {
        console.log(error);
      }
    }

    const preCode = md.utils.escapeHtml(str);
    html = html + preCode;
    return `<pre class="hljs"><code>${html}</code>${linesNum}</pre><textarea style="position: absolute;top: -9999px;left: -9999px;z-index: -9999;" id="copy${codeIndex}">${str.replace(
      /<\/textarea>/g,
      '&lt;/textarea>'
    )}</textarea>`;
  },
})
  .use(require('markdown-it-anchor'), {
    level: [1, 2, 3],
    slugify: (s) => uslug(s),
  })
  .use(require('markdown-it-toc-done-right'), {
    containerClass: 'toc',
    containerId: 'toc',
    level: [1, 2, 3],
    slugify: (s) => uslug(s),
  });

/**
 * 创建一篇文章需要
 *  - 源文件
 *  - 输出目录
 */
class Post {
  constructor(postDir, postName, outputDir) {
    if (!postDir || !postName) {
      throw new Error('create new Post need postDir and postName');
    }

    this.postDir = postDir;
    this.outputDir = outputDir;
    this.postName = postName;

    this._load();
  }

  // private
  _load() {
    const fullPath = path.join(this.postDir, this.postName);
    this.content = fs.readFileSync(fullPath, 'utf-8');
    this._readMore();
    this._readFront();
    this._readContent();
  }

  _readMore() {
    const noFront = this.content.replace(/---\r?\n([\w\W]*)---\r?\n/, '');

    // 判断是否含有摘要符号
    const moreFlag = noFront.indexOf('<!--more-->');
    const moreFlagSpace = noFront.indexOf('<!-- more -->');
    const flag =
      moreFlag === -1 ? (moreFlagSpace === -1 ? -1 : moreFlagSpace) : moreFlag;

    const more = flag !== -1 ? noFront.slice(0, flag) : '';
    this.abstracts = more ? md.render(more) : '';
  }

  _readFront() {
    if (this.abstracts) {
      this.front = {
        ...fm(this.content).attributes,
        name: this.postName,
        abstracts: this.abstracts,
      };
      return;
    }

    this.front = {
      ...fm(this.content).attributes,
      name: this.postName,
      abstracts: this.abstracts ?? '',
    };
  }

  _readContent() {
    const noFront = this.content.replace(/---\r?\n([\w\W]*)---\r?\n/, '');
    const noMore = noFront
      .replace('<!--more-->', '')
      .replace('<!-- more -->', '');
    this.contentHtml = md.render('${toc}' + noMore);
  }

  _render() {
    const html = art.render(this.postTemplate, {
      layout: this.layoutTemplate,
      author: this.config.author,
      description: this.config.description,
      ...this.front,
      codeTheme: this.config.codeTheme,
      sidebar: this.sidebar.sidebarTemplate,
      sidebarData: this.sidebar.sidebarData,
      footer: this.footer.footerTemplate,
      footerData: this.footer.footerData,
      postContent: this.contentHtml,
      friends: this.config.friends || '',
    });
    return html;
  }

  _writeToTags(html) {
    this.front.tags?.forEach((element) => {
      writeFile(
        path.join(
          this.outputDir,
          'tags',
          element || 'blog',
          this.postName.replace('.md', ''),
          'index.html'
        ),
        html
      );
    });
  }

  _writeToCategory(html) {
    writeFile(
      path.join(
        this.outputDir,
        'categories',
        this.front.category || 'blog',
        this.postName.replace('.md', ''),
        'index.html'
      ),
      html
    );
  }

  _renderItem() {
    const data = {
      ...this.front,
      date: this.front.date.slice(0, this.front.date.indexOf(' ')),
      url: `/categories/${this.front.category}/${this.front.name.replace(
        '.md',
        ''
      )}`,
    };
    return art.render(this.itemTemplate, data);
  }

  // public
  loadConfig(config) {
    this.config = config;
    return this;
  }
  loadTemplate({ layoutTemplate, postTemplate, itemTemplate }, hasItem = true) {
    this.layoutTemplate = layoutTemplate;
    this.postTemplate = fs.readFileSync(postTemplate, 'utf-8');
    if (hasItem) this.itemTemplate = fs.readFileSync(itemTemplate, 'utf-8');
    return this;
  }
  loadSidebar({ sidebarTemplate, sidebarData }) {
    this.sidebar = { sidebarTemplate, sidebarData };
    return this;
  }
  loadFooter({ footerTemplate, footerData }) {
    this.footer = { footerTemplate, footerData };
    return this;
  }

  render() {
    return this._render();
  }

  build() {
    if (!this.outputDir) {
      throw new Error('You need set outputDir');
    }

    const postHtml = this._render();
    this._writeToCategory(postHtml);
    this._writeToTags(postHtml);

    return this._renderItem();
  }
}

module.exports = Post;
