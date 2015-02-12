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

        .controller('NpMoviesController', ['$scope', '$uiPageIndicators', function ($scope, $uiPageIndicators) {
            $scope.pageIndicators = $uiPageIndicators.getInstance();

            $scope.movies = [
                {
                    title: 'Title 1'
                },
                {
                    title: 'Title 2'
                },
                {
                    title: 'Title 3'
                }
            ];
        }]);
}());
