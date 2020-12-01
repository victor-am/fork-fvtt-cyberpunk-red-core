// TODO-- MAKE SURE WE CAN USE SCSS

const gulp = require('gulp');
const less = require('gulp-scss');

/* ----------------------------------------- */
/*  Compile LESS
/* ----------------------------------------- */

const CPR_LESS = ["less/*.less"];
function compileLESS() {
  return gulp.src("less/cpr.less")
    .pipe(less())
    .pipe(gulp.dest("./"))
}
const css = gulp.series(compileLESS);

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

function watchUpdates() {
  gulp.watch(CPR_LESS, css);
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.default = gulp.series(
  gulp.parallel(css),
  watchUpdates
);
exports.css = css;