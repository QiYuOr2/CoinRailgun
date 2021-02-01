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

// program
//     .command('server [dir]')
//     .description('preview the blog by running a local server')
//     .action(require('../lib/preview.js'))

program
  .command('build [dir]')
  .description('将文章打包为html')
  .option('-o, --output <dir>', 'render blog to html')
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
