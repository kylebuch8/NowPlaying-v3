(function () {
    'use strict';

    /*global angular, FastClick*/
    angular.module('nowPlaying', [
        'ngAnimate',
        'npMovies',
        'npMovie'
    ]);

    if ('addEventListener' in document) {
        document.addEventListener('DOMContentLoaded', function() {
            FastClick.attach(document.body);
        }, false);
    }
}());
