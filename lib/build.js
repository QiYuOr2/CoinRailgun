const path = require('path');
const { build } = require('./utils');

module.exports = (dir, options) => {
  dir = dir ?? '.';
  const outputDir = path.resolve(dir, options.output ?? 'dist');
  const sourceDir = path.resolve(dir, 'source');
  const postDir = path.join(sourceDir, '_posts');
  const siteConfig = require(path.resolve(dir, 'site.config.json'));
  build(postDir, siteConfig);
};
