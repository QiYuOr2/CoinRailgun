const path = require('path');
const renderIndex = require('./renderIndex');
const { writeFile, copyFile } = require('./writeFile');

const build = (dirConfig, siteConfig) => {
  const { postDir, templateDir, outputDir } = dirConfig;
  const { title, author, description, avatar } = siteConfig.basic;
  const sidebarConfig = {
    title,
    avatar,
    author,
    description,
    about: siteConfig.theme.about,
    nav: siteConfig.theme.nav,
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

module.exports = build;
