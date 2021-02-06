const path = require('path');
const fs = require('fs-extra');
const dayjs = require('dayjs');

module.exports = (dir) => {
  dir = dir ?? '.';

  const templateDir = path.resolve(__dirname, '..', 'template');
  fs.copySync(templateDir, path.resolve(dir));
  fs.ensureDirSync(path.resolve(dir, 'source'));

  newPost(dir);
};

function newPost(dir) {
  const firstPost = [
    '---',
    'title: Hello World',
    'date: ' + dayjs().format('YYYY/MM/DD HH:mm:ss'),
    'tags: ' + '[blog,CoinRailgunn]',
    'category: ' + 'welcome',
    '---',
    '',
    'Welcome to my blog, this is my first post',
    '<!-- more -->'
  ].join('\n');

  const file = path.resolve(dir, 'source', '_posts', 'hello.md');
  fs.outputFileSync(file, firstPost);

  console.log("博客初始化完成，键入'crn new <postName>'即可创建新的文章");
}
