(function () {
    'use strict';

    /*global angular, FastClick*/
    angular.module('nowPlaying', [
        'ngAnimate',
        'npMovies',
        'npMovie'
    ]);

    if (typeof cordova !== 'undefined') {
        document.addEventListener('deviceready', function () {
            angular.bootstrap(document.body, ['nowPlaying']);
        });
    } else {
        angular.bootstrap(document.body, ['nowPlaying']);
    }

    if ('addEventListener' in document) {
        document.addEventListener('DOMContentLoaded', function() {
            FastClick.attach(document.body);
        }, false);
    }
}());
