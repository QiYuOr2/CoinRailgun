const path = require('path');
const build = require('./utils');

module.exports = (dir, options) => {
  dir = dir ?? '.';
  const outputDir = path.resolve(dir, options.output ?? 'build');
  const sourceDir = path.resolve(dir, 'source');
  const postDir = path.join(sourceDir, '_posts');
  const siteConfig = require(path.resolve(dir, 'site.config.json'));
  const templateDir = path.resolve(dir, 'theme', siteConfig.theme.name);
  build({ postDir, templateDir, outputDir }, siteConfig);
  console.log('页面生成成功！');
};
