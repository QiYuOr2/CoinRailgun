const path = require('path');
const CustomPage = require('./utils/customPage');
const Page = require('./utils/page');

module.exports = (dir, options) => {
  dir = dir ?? '.';
  const outputDir = path.resolve(dir, options.output ?? 'build');
  const sourceDir = path.resolve(dir, 'source');
  const postDir = path.join(sourceDir, '_posts');
  const siteConfig = require(path.resolve(dir, 'site.config.json'));
  const templateDir = path.resolve(dir, 'theme', siteConfig.theme.name);

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
  const { footer, highlight } = siteConfig.theme;
  const footerConfig = {
    beian: footer.beian,
    year: footer.copyright.year,
    author,
  };

  const pageConfig = {
    title: siteConfig.basic.title,
    author: siteConfig.basic.author,
    description: siteConfig.basic.description,
    pageSize: siteConfig.theme.pageSize,
    footerConfig,
    sidebarConfig,
    outputDir,
    codeTheme: highlight,
  };

  const page = new Page(postDir, pageConfig);

  page
    .loadTemplate({
      templateBaseDir: templateDir,
      postItemTemplate: 'layout/post_item.art',
      postListTemplate: 'layout/post_list.art',
      sidebarTemplate: 'layout/sidebar.art',
      layoutTemplate: 'layout/layout.art',
      footerTemplate: 'layout/footer.art',
      pageTemplate: 'layout/page.art',
      postTemplate: 'layout/post.art',
    })
    .build();

  siteConfig.theme.nav.forEach((item) => {
    const navPage = new CustomPage(postDir, {
      ...pageConfig,
      title: `${item.label} | ${pageConfig.title}`,
      name: item.name,
    });

    navPage
      .loadTemplate({
        templateBaseDir: templateDir,
        sidebarTemplate: 'layout/sidebar.art',
        sidebarData: page.sidebarData,
        categoriesData: page.categories,
        tagsData: page.tags,
        layoutTemplate: 'layout/layout.art',
        footerTemplate: 'layout/footer.art',
        customTemplate: `layout/${item.name}.art`,
      })
      .build();
  });

  const aboutPage = new CustomPage(postDir, {
    ...pageConfig,
    title: `关于 | ${pageConfig.title}`,
    name: 'about',
  });
  aboutPage
    .loadTemplate({
      templateBaseDir: templateDir,
      sidebarTemplate: 'layout/sidebar.art',
      sidebarData: page.sidebarData,
      categoriesData: page.categories,
      tagsData: page.tags,
      layoutTemplate: 'layout/layout.art',
      footerTemplate: 'layout/footer.art',
      customTemplate: `layout/post.art`,
    })
    .build();

  console.log('页面生成成功！');
};
