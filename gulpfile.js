const fs = require('fs')
const { series, parallel, src, dest, watch } = require('gulp') // series 顺序执行 parallel 并发执行
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const conventionalRecommendedBump = require('conventional-recommended-bump');
const conventionalGithubReleaser = require('conventional-github-releaser');
const execa = require('execa');
const { promisify } = require('util');
const dotenv = require('dotenv');
// const requireDir = require('require-dir')
// requireDir('./task', { extensions: ['.js'] })
function clean(cb) {
  console.log('clean')
  cb()
}

function css(cb) {
  console.log('css')
  cb()
}

function javascript(cb) {
  console.log('js')
  src('src/**/*.js')
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(dest('dist'))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest('dist'))
  cb()
}

async function AsyncTask() {
  const { version } = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
  console.log(version)
  await Promise.resolve('async task')
}

function PromiseTest() {
  return Promise.resolve('Promise Test')
}

function build(cb) {
  console.log('build')
  cb()
}

function watchTaks() {
  watch('src/**/*.js', function (cb) {
    console.log('watch update...')
    cb()
  })
}
// load environment variables
const result = dotenv.config();

if (result.error) {
  throw result.error;
}

// Conventional Changelog preset
const preset = 'angular';
// print output of commands into the terminal
const stdio = 'inherit';

async function bumpVersion() {
  // get recommended version bump based on commits
  const { releaseType } = await promisify(conventionalRecommendedBump)({ preset });
  // bump version without committing and tagging
  await execa('npm', ['version', releaseType, '--no-git-tag-version'], {
    stdio,
  });
}

async function changelog() {
  await execa(
    'npx',
    [
      'conventional-changelog',
      '--preset',
      preset,
      '--infile',
      'CHANGELOG.md',
      '--same-file',
    ],
    { stdio }
  );
}

async function commitTagPush() {
  // even though we could get away with "require" in this case, we're taking the safe route
  // because "require" caches the value, so if we happen to use "require" again somewhere else
  // we wouldn't get the current value, but the value of the last time we called "require"
  const { version } = JSON.parse(await promisify(fs.readFile)('package.json'));
  const commitMsg = `chore: release ${version}`;
  await execa('git', ['add', '.'], { stdio });
  await execa('git', ['commit', '--message', commitMsg], { stdio });
  await execa('git', ['tag', `v${version}`], { stdio });
  await execa('git', ['push', '--follow-tags'], { stdio });
}

function githubRelease(done) {
  conventionalGithubReleaser(
    { type: 'oauth', token: process.env.GH_TOKEN },
    { preset },
    done
  );
}

exports.release = series(
  bumpVersion,
  changelog,
  commitTagPush,
  githubRelease
);
// clean 公共任务
// css, javascript, build 私有任务
exports.clean = clean
exports.default = series(clean, parallel(css, javascript), build, PromiseTest, AsyncTask, watchTaks)