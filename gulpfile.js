const fs = require('fs')
const { series, parallel, src, dest, watch } = require('gulp') // series 顺序执行 parallel 并发执行
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')

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

// clean 公共任务
// css, javascript, build 私有任务
exports.clean = clean
exports.default = series(clean, parallel(css, javascript), build, PromiseTest, AsyncTask, watchTaks)