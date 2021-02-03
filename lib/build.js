const path = require('path');
const build = require('./utils');
const Page = require('./utils/page');

module.exports = (dir, options) => {
  dir = dir ?? '.';
  const outputDir = path.resolve(dir, options.output ?? 'build');
  const sourceDir = path.resolve(dir, 'source');
  const postDir = path.join(sourceDir, '_posts');
  const siteConfig = require(path.resolve(dir, 'site.config.json'));
  const templateDir = path.resolve(dir, 'theme', siteConfig.theme.name);
  build({ postDir, templateDir, outputDir }, siteConfig);
  console.log('页面生成成功！');

  //------------------------------------------
  const { title, author, description, avatar } = siteConfig.basic;
  const sidebarConfig = {
    title,
    avatar,
    author,
    description,
    about: siteConfig.theme.about,
    nav: siteConfig.theme.nav,
    links: siteConfig.theme.links,
  };

  const page = new Page(
    postDir,
    { pageSize: siteConfig.theme.pageSize, sidebarConfig },
    {
      templateBaseDir: templateDir,
      postItemTemplate: 'layout/post_item.art',
      postListTemplate: 'layout/post_list.art',
    }
  );
  page.build();
};
