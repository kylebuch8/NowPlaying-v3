(function () {
    'use strict';

    /*global require*/
    var gulp = require('gulp'),
        browserSync = require('browser-sync'),
        reload = browserSync.reload,
        less = require('gulp-less'),
        rimraf = require('rimraf'),
        uglify = require('gulp-uglify'),
        sourcemaps = require('gulp-sourcemaps'),
        concat = require('gulp-concat'),
        rename = require('gulp-rename'),
        usemin = require('gulp-usemin');

    gulp.task('browser-sync', function () {
        var files = [
            'app/**/*.html',
            'app/**/*.js',
            'app/**/*.png',
            'app/**/*.jpg',
            'app/**/*.css'
        ];

        browserSync(files, {
            server: {
                baseDir: './app'
            }
        });
    });

    gulp.task('less', function () {
        gulp.src('app/less/main.less')
            .pipe(less())
            .pipe(gulp.dest('app/styles/'))
            .pipe(reload({ stream: true }));
    });

    gulp.task('clean', function (cb) {
        return rimraf('./dist', cb);
    });

    gulp.task('minify', ['clean'], function () {
        gulp.src(['./app/app.js', './app/common/**/*.js', './app/components/**/*.js'], { base: './app' })
            .pipe(sourcemaps.init())
            .pipe(concat('app.js'))
            .pipe(uglify())
            .pipe(rename(function (path) {
                if (path.extname === '.js') {
                    path.basename += '.min';
                }
            }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist/scripts'));

        gulp.src(['./app/app.js', './app/common/**/*.js', './app/components/**/*.js'])
            .pipe(concat('app.js'))
            .pipe(gulp.dest('./dist/scripts'));
    });

    gulp.task('copy', ['clean'], function () {
        gulp.src(['./app/components/**/*.html', './app/fonts/**/*', './app/styles/*', './app/bower_components/modernizr/modernizr.min.js'], { base: './app' })
            .pipe(gulp.dest('./dist'));

        gulp.src(['./app/app.js', './app/common/**/*.js', './app/components/**/*.js'], { base: './app' })
            .pipe(gulp.dest('./dist'));
    });

    gulp.task('usemin', ['clean'], function () {
        gulp.src('./app/index.html')
            .pipe(usemin({
                vendor: [uglify()]
            }))
            .pipe(gulp.dest('./dist'));
    });

    gulp.task('clean-cordova', function (cb) {
        return rimraf('./cordova/www', cb);
    });

    gulp.task('build-cordova', ['less', 'clean-cordova'], function () {
        gulp.src('./app/**/*')
            .pipe(gulp.dest('./cordova/www'));
    });

    gulp.task('build', ['less', 'minify', 'copy', 'usemin']);

    gulp.task('default', ['less', 'browser-sync'], function () {
        gulp.watch('app/**/*.less', ['less']);
    });
}());
