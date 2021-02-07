const Koa = require('koa');
const staticServe = require('koa-static');
const path = require('path');

module.exports = (dir, options) => {
  dir = dir ?? '.';
  const app = new Koa();

  const siteConfig = require(path.resolve(dir, 'site.config.json'));

  const outputDir = path.resolve(dir, options.dir ?? 'build');
  app.use(staticServe(outputDir));

  app.listen(siteConfig.dev_server.port, () => {
    console.log(
      `在浏览器中打开 http://localhost:${siteConfig.dev_server.port} 以预览网页`
    );
  });
};
