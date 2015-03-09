(function () {
    'use strict';

    /*global angular, FastClick*/
    angular.module('nowPlaying', [
        'ngAnimate',
        'npMovies',
        'npMovie',
        'services.movies'
    ])

        .run(['movies', '$timeout', '$window', function (movies, $timeout, $window) {
            function resumeHandler(movies, $timeout, $window) {
                $timeout(function () {
                    if (movies.needsRefresh()) {
                        /*
                         * start everything up again
                         */
                        $window.location.reload();
                    }
                });
            }

            /*
             * it is safe to add these events since the application
             * was bootstrapped in the device ready callback
             */
            document.addEventListener('resume', function () {
                resumeHandler(movies, $timeout, $window);
            });
        }]);

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
