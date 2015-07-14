'use strict';

var gulp = require('gulp')
  ;

var opts = require('./tasks/gulp-config.js')(gulp, {});

require('./tasks/server.js')(gulp, opts);
require('./tasks/watch.js')(gulp, opts);

gulp.task('default', ['serve', 'watch-client']);
