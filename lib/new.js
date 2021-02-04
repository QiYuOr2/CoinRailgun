const fs = require('fs-extra');
const path = require('path');
const dayjs = require('dayjs');

module.exports = (name) => {
  const post = [
    '---',
    `title: ${name}`,
    'date: ' + dayjs().format('YYYY/MM/DD HH:mm:ss'),
    'tags: ' + '[blog]',
    'category: ' + 'code',
    '---',
    '',
  ].join('\n');

  const file = path.resolve('source', '_posts', `${name}.md`);
  fs.outputFileSync(file, post);

  console.log(`source/_posts/${name}.md 创建成功！`);
};
