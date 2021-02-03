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

// 分类
let categories = {};
let tags = {};

const loadPostMd = _.curry((filePath, fileName) => {
  const fullPath = path.resolve(filePath, fileName);
  return { fileContent: fs.readFileSync(fullPath, 'utf-8'), fileName };
});

/**
 * 获取摘要
 */
const readMore = ({ fileContent }) => {
  const noFront = fileContent.replace(/---\r?\n([\w\W]*)---\r?\n/, '');

  // 判断是否含有摘要符号
  const moreFlag = noFront.indexOf('<!--more-->');
  const moreFlagSpace = noFront.indexOf('<!-- more -->');
  const flag =
    moreFlag === -1 ? (moreFlagSpace === -1 ? -1 : moreFlagSpace) : moreFlag;

  const more = flag !== -1 ? noFront.slice(0, flag) : '';
  return more ? md.render(more) : '';
};

/**
 * 读取文章头部yml配置
 */
const readFront = ({ fileContent, fileName }) => {
  const more = readMore({ fileContent });
  if (more) {
    return { ...fm(fileContent).attributes, name: fileName, abstracts: more };
  }
  return { ...fm(fileContent).attributes, name: fileName };
};

/**
 * 渲染文章列表项
 */
const renderPostItem = _.curry((templateDir, front) => {
  const template = fs.readFileSync(
    path.join(templateDir, 'layout/post_item.art'),
    'utf-8'
  );

  categories[front.category]
    ? categories[front.category]++
    : (categories[front.category] = 0);

  const data = {
    ...front,
    date: front.date.slice(0, front.date.indexOf(' ')),
    url: `/${front.category}/${front.name.replace('.md', '')}`,
  };

  return art.render(template, data);
});

/**
 * 渲染分页器
 */
const renderPagination = _.curry((length, current) => {
  const mapIndexed = _.addIndex(_.map);

  const pages = mapIndexed(
    (_item, index) => ({
      key: index + 1,
      isCurrent: index + 1 === current,
      href: `/page/${index + 1}`,
    }),
    new Array(length)
  );

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
});

/**
 * 分页 \
 * -> [['hello.md', 'test.md', ...], ['world.md', 'test2.md', ...]]
 */
const slicePages = _.curry((postDir, pageSize) => {
  const mdFiles = glob.sync('**/*.md', { cwd: postDir });
  const slicedFiles = [];
  let slicingFiles = mdFiles;
  for (let i = 1; i <= Math.ceil(mdFiles.length / pageSize); i++) {
    slicedFiles.push(slicingFiles.slice(0, pageSize * i));
    slicingFiles = slicingFiles.slice(pageSize * i);
  }
  return slicedFiles;
});

/**
 * 渲染文章列表
 */
const renderPostList = _.curry((postDir, templateDir, pageSize) => {
  const mdFiles = glob.sync('**/*.md', { cwd: postDir });
  const generatePostItem = _.compose(
    renderPostItem(templateDir),
    readFront,
    loadPostMd(postDir)
  );

  slicePages(postDir, pageSize);
  // 分页
  // index页的所有文章
  const indexFiles = mdFiles.slice(0, pageSize);

  return {
    postList: _.map(generatePostItem, indexFiles),
    pagination: renderPagination(Math.ceil(mdFiles.length / pageSize), 1),
  };
});

/**
 * 渲染index页
 */
const renderIndex = _.curry((config, sidebarConfig) => {
  const template = fs.readFileSync(
    path.join(config.templateDir, 'layout/index.art'),
    'utf-8'
  );
  const postListPath = path.join(config.templateDir, 'layout/post_list.art');
  const sidebarPath = path.join(config.templateDir, 'layout/sidebar.art');
  const footerPath = path.join(config.templateDir, 'layout/footer.art');

  const { postList, pagination } = renderPostList(
    config.postDir,
    config.templateDir,
    config.pageSize
  );

  const getCountByName = {
    categories: Object.keys(categories).length,
    tags: Object.keys(tags).length,
    posts: postList.length,
  };
  sidebarConfig.nav = _.map(
    (item) => ({
      label: item.label,
      url: item.url,
      count: getCountByName[item.name],
    }),
    sidebarConfig.nav
  );

  return art.render(template, {
    layout: path.join(config.templateDir, 'layout/layout.art'),
    title: sidebarConfig.title,
    author: config.author,
    description: config.description,
    postList: postListPath,
    postData: { posts: postList, pagination },
    sidebar: sidebarPath,
    sidebarData: sidebarConfig,
    footer: footerPath,
    footerData: config.footer,
    links: sidebarConfig.links,
  });
});

module.exports = renderIndex;
