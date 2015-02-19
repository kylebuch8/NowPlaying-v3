(function () {
    'use strict';

    /*global angular*/
    angular.module('npMovies', [
        'ngRoute',
        'directives.uiPageIndicators',
        'directives.uiAnimatedPages'
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
            '$uiAnimatedPages',
            '$uiPageIndicators',
            function ($scope, $http, $location, $uiAnimatedPages, $uiPageIndicators) {
                $scope.animation = 'home';
                $scope.uiAnimatedPages = $uiAnimatedPages.getInstance();
                $scope.pageIndicators = $uiPageIndicators.getInstance();

                $scope.uiAnimatedPages.disableScroll();

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

                    $scope.uiAnimatedPages.enableScroll();
                };

                $scope.goBack = function() {
                    $scope.displayMovie = false;
                    $scope.uiAnimatedPages.disableScroll();
                };

                $http.get('data/data.json')
                    .success(function (movies) {
                        movies.forEach(function (movie) {
                            var duration = getDuration(movie.runtime);
                            movie.duration = duration.hours + 'h ' + duration.minutes + 'm';
                        });

                        $scope.movies = movies;
                    });
        }]);
}());
