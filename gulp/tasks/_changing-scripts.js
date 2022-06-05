/* eslint-disable arrow-body-style */
import { dest } from 'gulp';
import rename from 'gulp-rename';
import browserify from 'browserify';
import vinylStream from 'vinyl-source-stream';
import vinylBuffer from 'vinyl-buffer';
import uglify from 'gulp-uglify-es';
import notify from 'gulp-notify';
import babelify from 'babelify';
import glob from 'glob';
import gulpIf from 'gulp-if';
import sourcemaps from 'gulp-sourcemaps';
import eventStream from 'event-stream';
import browserSync from 'browser-sync';
import { config } from '../config';

const changingScripts = (done) => {
  const files = [
    config.source.scriptsHome,
    ...glob.sync(config.source.scriptsModules),
    ...glob.sync(config.source.scriptsPages),
  ];
  const taskScripts = files.map((file) => {
    return (
      browserify({
        entries: [file],
        transform: [
          babelify.configure({
            presets: ['@babel/preset-env'],
          }),
        ],
      })
        .bundle()
        .pipe(vinylStream(file))
        .pipe(vinylBuffer())
        .pipe(gulpIf(config.isDev, sourcemaps.init({
          loadMaps: true,
        })))
        .pipe(rename({
          dirname: '',
        }))
        .pipe(gulpIf(config.isDev, sourcemaps.write()))
        .pipe(dest(config.build.scripts))
        .pipe(gulpIf(config.isProd, uglify({
          toplevel: true,
        }).on('error', notify.onError())))
        .pipe(rename({
          extname: '.min.js',
          dirname: '',
        }))
        .pipe(dest(config.build.scripts))
        .pipe(browserSync.stream())
    );
  });
  return eventStream.merge(taskScripts).on('end', done);
};

export default changingScripts;
