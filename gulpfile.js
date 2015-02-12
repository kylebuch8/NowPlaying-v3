(function () {
    'use strict';
    
    /*global require*/
    var gulp = require('gulp'),
        browserSync = require('browser-sync'),
        reload = browserSync.reload,
        less = require('gulp-less');
    
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
    
    gulp.task('default', ['less', 'browser-sync'], function () {
        gulp.watch('app/**/*.less', ['less']);
    });
}());