(function () {
    'use strict';

    /*global angular, FastClick*/
    angular.module('nowPlaying', [
        'npMovies',
        'npMovie'
    ]);

    if ('addEventListener' in document) {
        document.addEventListener('DOMContentLoaded', function() {
            FastClick.attach(document.body);
        }, false);
    }
}());
