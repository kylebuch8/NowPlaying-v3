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
                    title: 'How to Train Your Dragon 2',
                    score: '92%',
                    poster: 'images/poster.jpg',
                    background: 'images/poster_bg.jpg'
                },
                {
                    title: 'The SpongeBob Movie: Sponge Out of Water',
                    score: '75%',
                    poster: 'images/spongebob.jpg',
                    background: 'images/spongebob_bg.jpg'
                },
                {
                    title: 'The Hunger Games: Mockingjay - Part 1',
                    score: '65%',
                    poster: 'images/mockingjay.jpg',
                    background: 'images/mockingjay_bg.jpg'
                },
                {
                    title: 'Jupiter Ascending',
                    score: '22%',
                    poster: 'images/jupiter.jpg',
                    background: 'images/jupiter_bg.jpg'
                }
            ];
        }]);
}());
