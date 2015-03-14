(function () {
    'use strict';

    /*global angular, FastClick*/
    angular.module('nowPlaying', [
        'ngAnimate',
        'npMovies',
        'npMovie',
        'services.movies'
    ])

        .run([
            '$movies',
            '$rootScope',
            '$timeout',
            '$window',
            '$location',
            function ($movies, $rootScope, $timeout, $window, $location) {
                function resumeHandler($movies, $timeout, $window) {
                    $timeout(function () {
                        if ($movies.needsRefresh()) {
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
                    resumeHandler($movies, $timeout, $window);
                });

                $rootScope.$on('$routeChangeError', function () {
                    $location.path('/');
                });
            }
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
