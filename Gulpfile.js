var gulp = require('gulp');
var jslint = require('gulp-jslint');

gulp.task('jslint', function () {
  return gulp.src(['./models/*.js', './routes/*.js', './public/js/libs/PBHelperTools.js',
                   './globals.js', './app.js'])
      .pipe(jslint({
        node: true,
        vars: true,
        unparam: true,
        nomen: true,
        white: true,
        evil: true,
        errorsOnly: false,
        plusplus: true,
        bitwise: true,
        todo: true,
        stupid: true
      }));
});

gulp.task('default', ['jslint']);