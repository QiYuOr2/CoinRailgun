const { execSync } = require('child_process');
const dayjs = require('dayjs');

module.exports = (options) => {
  const dir = options.dir ?? 'build';
  const siteConfig = require(path.resolve(dir, 'site.config.json'));
  const { username, repo, branch } = siteConfig;
  try {
    execSync(`git init ${dir}`, { encoding: 'utf-8' });
    execSync(`cd ${dir}& git add . `, { encoding: 'utf-8' });
    const commitMessage = `update by CoinRailgun: ${dayjs().format(
      'YYYY-MM-DD HH:mm:ss'
    )}`;
    execSync(`cd ${dir}& git commit -m "${commitMessage}"`, {
      encoding: 'utf-8',
    });

    if (repo) {
      const result = execSync(
        `cd ${dir}& git push -f git@github.com:${username}/${repo}.git ${branch}:gh-pages`
      );
      console.log(result);
      return;
    }

    const result = execSync(
      `cd ${dir}& git push -f git@github.com:${username}/${username}.github.io.git ${branch}`
    );
    console.log(result);
  } catch (error) {
    console.log(error.message);
  }
};
