(function () {
    'use strict';

    /*global angular*/
    angular.module('npMovie', ['ngRoute'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/movie', {
                    templateUrl: 'components/np-movie/np-movie.html',
                    controller: 'MovieController'
                });
        }])

        .controller('MovieController', ['$scope', '$location', function ($scope, $location) {
            $scope.animation = 'detail';

            $scope.goBack = function () {
                $location.path('/');
            };
        }]);
}());
