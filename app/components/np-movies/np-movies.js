(function () {
    'use strict';

    /*global angular*/
    angular.module('npMovies', [
        'ngRoute',
        'directives.uiPageIndicators',
        'directives.uiAnimatedPages',
        'directives.embedVideo',
        'directives.uiNavButton',
        'directives.uiToast',
        'services.movies',
        'services.analytics'
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
            'movies',
            'analytics',
            function ($scope, $rootScope, $http, $location, $timeout, $uiAnimatedPages, $uiPageIndicators, $uiToast, movies, analytics) {
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

                function getDataSuccessHandler(movies) {
                    $scope.loading = false;
                    $scope.movies = movies;
                }

                function getDataErrorHandler() {
                    $scope.loading = false;

                    var toast = $uiToast.show({
                        text: 'Couldn\'t retrieve movies.',
                        delay: 0
                    });

                    toast.result.then(getData);
                }

                function getData() {
                    /*
                     * reset everything
                     */
                    $scope.movies = null;
                    $scope.movie = null;
                    $scope.displayMovie = false;
                    $scope.showingTrailer = false;

                    $scope.loading = true;
                    movies.get().then(getDataSuccessHandler, getDataErrorHandler);
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

                    analytics.trackEvent('Poster', 'Tap', $scope.movie.title);
                    analytics.trackPage('detail');
                };

                $scope.goBack = function() {
                    $scope.displayMovie = false;

                    /*
                     * disable scrolling. this is only here for ios
                     */
                    $scope.uiAnimatedPages.disableScroll();
                    $location.search('');

                    analytics.trackPage('movies');
                };

                $scope.showTrailer = function () {
                    $scope.showingTrailer = true;
                    $location.search('view', 'trailer');

                    analytics.trackEvent('Trailer', 'Tap', $scope.movie.title);
                    analytics.trackPage('trailer');
                };

                $scope.hideTrailer = function () {
                    $scope.showingTrailer = false;
                    $location.search('view', 'movie');

                    analytics.trackPage('detail');
                };

                /*
                 * kick everything off
                 */
                getData();

                analytics.trackPage('movies');
        }]);
}());
