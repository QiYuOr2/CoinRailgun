const fs = require('fs-extra');
const path = require('path');
const fm = require('front-matter');
const art = require('art-template');
const { writeFile } = require('./writeFile');
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
    }
    this.front = { ...fm(this.content).attributes, name: this.postName };
  }

  _render() {}

  _writeToTags(html) {
    this.front.tags.forEach((element) => {
      writeFile(
        path.join(
          this.outputDir,
          element || 'blog',
          this.postName,
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
        this.front.category || 'blog',
        this.postName,
        'index.html'
      ),
      html
    );
  }

  // public
  loadTemplate(templateConfig) {
    const { templateBaseDir, templateDir } = templateConfig;
    this.templateBaseDir = templateBaseDir;
    this.templateDir = templateDir;
    this.template = fs.readFileSync(path.join(templateBaseDir, templateDir));
    return this;
  }

  renderItem(templateDir) {
    const template = fs.readFileSync(templateDir, 'utf-8');
    const data = {
      ...this.front,
      date: this.front.date.slice(0, this.front.date.indexOf(' ')),
      url: `/${this.front.category}/${this.front.name.replace('.md', '')}`,
    };
    return art.render(template, data);
  }

  build() {
    if (!this.outputDir) {
      throw new Error('You need set outputDir');
    }

    const postHtml = this._render();
    writeFile(
      path.join(
        this.outputDir,
        this.front.category || 'default',
        this.postName,
        'index.html'
      ),
      postHtml
    );
    this._writeToCategory(postHtml);
    this._writeToTags(postHtml);
  }
}

module.exports = Post;
