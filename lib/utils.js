const _ = require('ramda');
const fm = require('front-matter');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const art = require('art-template');
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

const loadPostMd = _.curry((filePath, fileName) => {
  const fullPath = path.resolve(filePath, fileName);
  return fs.readFileSync(fullPath, 'utf-8');
});

/**
 * 读取文章头部yml配置
 */
const readFront = (fileContent) => {
  return fm(fileContent).attributes;
};

/**
 * 读取文章内容
 */
const readContent = (fileContent) => {
  return md.render(fileContent);
};

/**
 * 渲染文章列表项
 */
const renderPostItem = _.curry((theme, front) => {
  const template = fs.readFileSync(
    path.join(__dirname, '../template/theme', theme, 'layout/post_item.art'),
    'utf-8'
  );

  const data = { ...front };

  return art.render(template, data);
});

/**
 * 渲染文章列表
 */
const renderPostList = _.curry((postDir, theme) => {
  const mdFiles = glob.sync('**/*.md', { cwd: postDir });
  const generatePostItem = _.compose(
    renderPostItem(theme),
    readFront,
    loadPostMd(postDir)
  );

  return _.map(generatePostItem, mdFiles);
});

/**
 * 渲染index页
 */
const renderIndex = _.curry((theme, postList) => {
  const template = fs.readFileSync(
    path.join(__dirname, '../template/theme', theme, 'layout/index.art'),
    'utf-8'
  );

  return art.render(template, {
    layout: path.join(
      __dirname,
      '../template/theme',
      theme,
      'layout/layout.art'
    ),
    title: '测试',
    content: postList,
  });
});

module.exports.build = (dir, siteConfig) => {
  const theme = siteConfig.theme.name;
  const indexPage = renderIndex(theme, renderPostList(dir, theme));

  console.log(indexPage);
};
