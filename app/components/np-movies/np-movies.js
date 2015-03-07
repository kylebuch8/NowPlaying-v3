(function () {
    'use strict';

    /*global angular*/
    angular.module('npMovies', [
        'ngRoute',
        'directives.uiPageIndicators',
        'directives.uiAnimatedPages',
        'directives.embedVideo',
        'directives.uiNavButton',
        'directives.uiToast'
    ])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'components/np-movies/np-movies.html',
                    controller: 'NpMoviesController',
                    reloadOnSearch: false
                });
        }])

        .controller('NpMoviesController', [
            '$scope',
            '$rootScope',
            '$http',
            '$location',
            '$timeout',
            '$uiAnimatedPages',
            '$uiPageIndicators',
            '$uiToast',
            function ($scope, $rootScope, $http, $location, $timeout, $uiAnimatedPages, $uiPageIndicators, $uiToast) {
                $rootScope.$on('$routeUpdate', function (event, current) {
                    switch (current.params.view) {
                        case 'movie':
                            $scope.displayMovie = true;
                            $scope.showingTrailer = false;
                            break;

                        case 'trailer':
                            $scope.showingTrailer = true;
                            break;

                        default:
                            $scope.goBack();
                    }
                });

                if (window.cordova) {
                    document.addEventListener('backbutton', function (event) {
                        if (!$scope.displayMovie) {
                            event.preventDefault();
                            navigator.app.exitApp();
                        } else {
                            navigator.app.backHistory();
                        }
                    });
                }

                $scope.animation = 'home';
                $scope.uiAnimatedPages = $uiAnimatedPages.getInstance();
                $scope.pageIndicators = $uiPageIndicators.getInstance();

                $scope.uiAnimatedPages.disableScroll();

                /*
                 * based on the number of minutes, return the number
                 * of hours and minutes
                 */
                function getDuration(runtime) {
                    var hours = Math.floor(runtime / 60),
                        minutes = runtime % 60;

                    return {
                        hours: hours,
                        minutes: minutes
                    };
                }

                function getData() {
                    $scope.loading = true;

                    $http.get('https://s3.amazonaws.com/nowplaying-v3/nowplaying.json')
                        .success(function (movies) {
                            $scope.loading = false;
                            movies.forEach(function (movie) {
                                /*
                                 * create a duration string for the view based
                                 * on the duration. ex: 1h 40m
                                 */
                                var duration = getDuration(movie.runtime);
                                movie.duration = duration.hours + 'h ' + duration.minutes + 'm';

                                /*
                                 * set the background images
                                 */
                                var mql = window.matchMedia('(min-width: 800px), (min-height: 800px)');
                                if (mql.matches) {
                                    movie.images.poster = movie.images.poster_lg;
                                    movie.images.bg = movie.images.bg_lg;
                                }
                            });

                            $scope.movies = movies;
                        })
                        .error(function () {
                            $scope.loading = false;

                            var toast = $uiToast.show({
                                text: 'Couldn\'t retrieve movies.',
                                delay: 0
                            });

                            toast.result.then(getData);
                        });
                }

                $scope.goToMovie = function () {
                    $scope.movie = $scope.movies[$scope.pageIndicators.active];
                    $scope.displayMovie = true;
                    $location.search('view', 'movie');

                    /*
                     * enable scrolling. this is only here for ios
                     */
                    $scope.uiAnimatedPages.enableScroll();

                    /*
                     * make sure we scroll back to the top
                     *
                     * i really don't like doing this here but i really
                     * don't feel like creating a directive to handle
                     * this. seems like over-kill for this one thing
                     */
                    $timeout(function () {
                        document.querySelector('.scroller').scrollTop = 0;
                    }, 0);
                };

                $scope.goBack = function() {
                    $scope.displayMovie = false;

                    /*
                     * disable scrolling. this is only here for ios
                     */
                    $scope.uiAnimatedPages.disableScroll();
                    $location.search('');
                };

                $scope.showTrailer = function () {
                    $scope.showingTrailer = true;
                    $location.search('view', 'trailer');
                };

                $scope.hideTrailer = function () {
                    $scope.showingTrailer = false;
                    $location.search('view', 'movie');
                };

                /*
                 * kick everything off
                 */
                getData();
        }]);
}());
