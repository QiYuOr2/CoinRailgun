const fs = require('fs-extra');

const writeFile = (filePath, fileContent) => {
  try {
    fs.outputFileSync(filePath, fileContent);
  } catch (error) {
    throw new Error(`${filePath}写入失败:\n${error}\n`);
  }
};

const copyFile = (src, dest) => {
  try {
    fs.copySync(src, dest);
  } catch (error) {
    throw new Error(`${src}复制失败:\n${error}\n`);
  }
};

module.exports = {
  writeFile,
  copyFile,
};
