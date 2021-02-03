const buildPage = (dirConfig, siteConfig, pageConfig, render) => {
  const { postDir, templateDir, outputDir } = dirConfig;
  const { title, author, description, avatar } = siteConfig.basic;
  const { about, nav, links, footer, pageSize } = siteConfig.theme;
  const sidebarConfig = {
    title,
    avatar,
    author,
    description,
    about,
    nav,
    links,
  };
  const footerConfig = {
    beian: footer.beian,
    year: footer.copyright.year,
    author,
  };

  const page = render(
    {
      postDir,
      templateDir,
      title,
      author,
      description,
      pageSize,
      footer: footerConfig,
    },
    sidebarConfig
  );

  copyFile(path.join(templateDir, 'assets'), path.join(outputDir, 'assets'));
  writeFile(path.join(outputDir, 'index.html'), page);
};

const build = (dirConfig, siteConfig) => {
  const { postDir, templateDir, outputDir } = dirConfig;
  const { title, author, description, avatar } = siteConfig.basic;
  const { about, nav, links } = sidebarConfig.theme;
  const sidebarConfig = {
    title,
    avatar,
    author,
    description,
    about,
    nav,
    links,
  };

  const { footer: footerConfig } = siteConfig.theme;
  const footer = {
    beian: footerConfig.beian,
    year: footerConfig.copyright.year,
    author,
  };

  const indexPage = renderIndex(
    {
      postDir,
      templateDir,
      title,
      author,
      description,
      pageSize: siteConfig.theme.pageSize,
      footer,
    },
    sidebarConfig
  );

  copyFile(path.join(templateDir, 'assets'), path.join(outputDir, 'assets'));
  writeFile(path.join(outputDir, 'index.html'), indexPage);
};

module.exports = buildPage;
