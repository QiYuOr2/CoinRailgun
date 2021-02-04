#! /usr/bin/env node

const program = require('commander');
const version = require('../package.json').version;

program
  .version(version)
  .command('init [dir]')
  .description('初始化博客')
  .action(require('../lib/init'));

program
  .command('new <name>')
  .description('创建新的文章')
  .action(require('../lib/new.js'));

program
  .command('server [dir]')
  .description('本地预览网站')
  .option('-d, --dir <dir>', 'build时输出的目录')
  .action(require('../lib/preview.js'));

program
  .command('build [dir]')
  .description('将文章渲染为html')
  .option('-o, --output <dir>', '输出目录')
  .action(require('../lib/build'));

// program
//     .command('clean')
//     .description('clean the blog dir')
//     .action(require('../lib/clean.js'))

// program
//     .command('page <name>')
//     .description('create a new page')
//     .action(require('../lib/page.js'))

program.parse(process.argv);
