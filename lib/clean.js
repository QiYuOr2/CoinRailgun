const fs = require('fs-extra');

module.exports = (options) => {
  fs.removeSync(options.dir ?? 'build');
  console.log('清理成功！');
};
