/*
 * movie module
 *
 * we need to have a selected movie from the $movies service
 * or the route will be rejected
 *
 * if the route is resolved, set the selected movie on the scope.
 * the back button listener is for android and only needed when
 * a trailer is showing. back will close the trailer.
 */
(function () {
    'use strict';

    /*global angular*/
    angular.module('npMovie', [
        'ngRoute',
        'directives.embedVideo',
        'directives.uiNavButton',
        'services.movies',
        'services.analytics'
    ])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/movie', {
                    templateUrl: 'components/np-movie/np-movie.html',
                    controller: 'MovieController',
                    resolve: {
                        selectedMovie: ['$q', '$movies', function ($q, $movies) {
                            var deferred = $q.defer(),
                                selected = $movies.getSelected();

                            if (selected) {
                                deferred.resolve(selected);
                            } else {
                                deferred.reject();
                            }

                            return deferred.promise;
                        }]
                    }
                });
        }])

        .controller('MovieController', [
            '$scope',
            '$location',
            'selectedMovie',
            '$analytics',
            function ($scope, $location, selectedMovie, $analytics) {
                function backButtonHandler() {
                    $scope.hideTrailer();
                    $scope.$apply();
                }

                $scope.goBack = function () {
                    $location.path('/');
                };

                $scope.showTrailer = function () {
                    $scope.showingTrailer = true;

                    if (window.cordova) {
                        document.addEventListener('backbutton', backButtonHandler);
                    }

                    $analytics.trackEvent('Trailer', 'Tap', $scope.movie.title);
                    $analytics.trackPage('trailer');
                };

                $scope.hideTrailer = function () {
                    $scope.showingTrailer = false;

                    if (window.cordova) {
                        document.removeEventListener('backbutton', backButtonHandler);
                    }

                    $analytics.trackPage('detail');
                };

                $scope.animation = 'detail';
                $scope.movie = selectedMovie.movie;

                $analytics.trackPage('detail');
            }]);
}());
