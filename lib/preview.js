const Koa = require('koa');
const staticServe = require('koa-static');
const path = require('path');

module.exports = (dir, options) => {
  dir = dir ?? '.';
  const app = new Koa();

  const outputDir = path.resolve(dir, options.dir ?? 'build');
  app.use(staticServe(outputDir));

  app.listen(6364, () => {
    console.log('running in http://localhost:6364');
  });
};
