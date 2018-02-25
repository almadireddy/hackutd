'use strict';

let gulp = require('gulp');
let electron = require('electron-connect').server.create();

gulp.task('serve', function () {

  // Start browser process
  electron.start();

  // Restart browser process
  gulp.watch('index.js', electron.restart);

  // Reload renderer process
  gulp.watch(['index.js', 'index.html', 'assets/css/main.css'], electron.reload);
});