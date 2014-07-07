var gulp = require('gulp');
var jslint = require('gulp-jslint');

gulp.task('jslint', function () {
  return gulp.src(['./models/*.js', './routes/*.js', './public/js/libs/PBHelperTools.js',
                   './globals.js', './app.js'])
      .pipe(jslint({
        node: true,
        unparam: true,
        nomen: true,
        white: true,
        evil: true,
        errorsOnly: false
      }));
});

gulp.task('default', ['jslint']);