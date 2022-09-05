const gulp = require("gulp");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const tsify = require("tsify");
const watchify = require("watchify");
const fancyLog = require("fancy-log");
const sourcemaps = require("gulp-sourcemaps");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify");

gulp.task("index-html", function () {
  return gulp.src("src/index.html").pipe(gulp.dest("dist"));
});

const watchBrowserify = watchify(
  browserify({
    basedir: ".",
    debug: true,
    entries: ["src/index.ts"],
    cache: {},
    packageCache: {},
  })
    .plugin(tsify)
    .transform("babelify", {
      presets: ["@babel/preset-env"],
      extensions: [".ts"],
    })
);

function bundle() {
  return watchBrowserify
    .bundle()
    .on("error", fancyLog)
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("dist"));
}
gulp.task("default", gulp.series(gulp.parallel("index-html"), bundle));
watchBrowserify.on("update", bundle);
watchBrowserify.on("log", fancyLog);
