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

        .controller('NpMoviesController', ['$scope', '$http', '$location', '$uiPageIndicators', function ($scope, $http, $location, $uiPageIndicators) {
            $scope.animation = 'home';
            $scope.pageIndicators = $uiPageIndicators.getInstance();

            $scope.goToMovie = function () {
                $location.path('/movie');
            };

            $http.get('data/data.json')
                .success(function (data) {
                    $scope.movies = data;
                });
        }]);
}());
