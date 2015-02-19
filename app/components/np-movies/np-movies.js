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
                    .success(function (data) {
                        $scope.movies = data;
                    });
        }]);
}());
