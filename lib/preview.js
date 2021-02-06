const Koa = require('koa');
const staticServe = require('koa-static');
const path = require('path');

module.exports = (dir, options) => {
  dir = dir ?? '.';
  const app = new Koa();

  const outputDir = path.resolve(dir, options.dir ?? 'build');
  app.use(staticServe(outputDir));

  app.listen(6364, () => {
    console.log('在浏览器中打开 http://localhost:6364 以预览网页');
  });
};
