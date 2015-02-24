(function () {
    'use strict';

    /*global angular*/
    angular.module('npMovies', [
        'ngRoute',
        'directives.uiPageIndicators',
        'directives.uiAnimatedPages',
        'directives.embedVideo'
    ])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'components/np-movies/np-movies.html',
                    controller: 'NpMoviesController'
                });
        }])

        .controller('NpMoviesController', [
            '$scope',
            '$http',
            '$location',
            '$timeout',
            '$uiAnimatedPages',
            '$uiPageIndicators',
            function ($scope, $http, $location, $timeout, $uiAnimatedPages, $uiPageIndicators) {
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

                $scope.goToMovie = function () {
                    $scope.movie = $scope.movies[$scope.pageIndicators.active];
                    $scope.displayMovie = true;

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
                };

                $scope.showTrailer = function () {
                    $scope.showingTrailer = true;
                };

                $scope.hideTrailer = function () {
                    $scope.showingTrailer = false;
                };

                $http.get('https://s3.amazonaws.com/nowplaying-v3/nowplaying.json')
                    .success(function (movies) {
                        movies.forEach(function (movie) {
                            /*
                             * create a duration string for the view based
                             * on the duration. ex: 1h 40m
                             */
                            var duration = getDuration(movie.runtime);
                            movie.duration = duration.hours + 'h ' + duration.minutes + 'm';
                        });

                        $scope.movies = movies;
                    });
        }]);
}());
