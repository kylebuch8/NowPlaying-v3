(function () {
    'use strict';

    /*global angular*/
    angular.module('npMovies', [
        'ngRoute',
        'directives.uiPageIndicators',
        'directives.uiAnimatedPages',
        'directives.uiToast',
        'services.movies',
        'services.analytics'
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
            '$location',
            '$timeout',
            '$uiAnimatedPages',
            '$uiPageIndicators',
            '$uiToast',
            '$movies',
            '$analytics',
            function ($scope, $location, $timeout, $uiAnimatedPages, $uiPageIndicators, $uiToast, $movies, $analytics) {
                $scope.animation = 'home';

                if (window.cordova) {
                    document.addEventListener('backbutton', backButtonHandler);
                }

                function backButtonHandler(event) {
                    event.preventDefault();

                    if ($scope.showingTrailer) {
                        $scope.$apply(function () {
                            $scope.hideTrailer();
                        });

                        return;
                    }

                    if ($scope.movie) {
                        $scope.$apply(function () {
                            $scope.goBack();
                        });

                        return;
                    }

                    navigator.app.exitApp();
                }

                function getDataSuccessHandler(movies) {
                    var selected = $movies.getSelected();

                    $scope.loading = false;
                    $scope.movies = movies;
                    $scope.selected = (selected) ? selected.index : 0;
                    $scope.pageIndicators.activate($scope.selected);
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
                    $scope.loading = true;
                    $movies.get().then(getDataSuccessHandler, getDataErrorHandler);
                }

                $scope.goToMovie = function (movie) {
                    $scope.uiAnimatedPages.enableScroll();

                    $scope.movie = movie;
                    $scope.detail = true;

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

                    $analytics.trackPage('detail');
                };

                $scope.goBack = function () {
                    $scope.uiAnimatedPages.disableScroll();
                    $scope.detail = false;

                    $analytics.trackPage('movies');
                };

                $scope.showTrailer = function () {
                    $scope.showingTrailer = true;

                    $analytics.trackEvent('Trailer', 'Tap', $scope.movie.title);
                    $analytics.trackPage('trailer');
                };

                $scope.hideTrailer = function () {
                    $scope.showingTrailer = false;
                    $analytics.trackPage('detail');
                };

                $scope.uiAnimatedPages = $uiAnimatedPages.getInstance();
                $scope.uiAnimatedPages.disableScroll();

                $scope.pageIndicators = $uiPageIndicators.getInstance();

                $scope.$on('$destroy', function () {
                    $scope.uiAnimatedPages.enableScroll();

                    if (window.cordova) {
                        document.removeEventListener('backbutton', backButtonHandler);
                    }
                });

                // $scope.goToMovie = function () {
                //     $scope.movie = $scope.movies[$scope.pageIndicators.active];
                //     $scope.displayMovie = true;
                //     $location.search('view', 'movie');
                //
                //     /*
                //      * enable scrolling. this is only here for ios
                //      */
                //     $scope.uiAnimatedPages.enableScroll();
                //
                //     /*
                //      * make sure we scroll back to the top
                //      *
                //      * i really don't like doing this here but i really
                //      * don't feel like creating a directive to handle
                //      * this. seems like over-kill for this one thing
                //      */
                //     $timeout(function () {
                //         document.querySelector('.scroller').scrollTop = 0;
                //     }, 0);
                //
                //     analytics.trackEvent('Poster', 'Tap', $scope.movie.title);
                //     analytics.trackPage('detail');
                // };

                // $scope.goBack = function() {
                //     $scope.displayMovie = false;
                //
                //     /*
                //      * disable scrolling. this is only here for ios
                //      */
                //     $scope.uiAnimatedPages.disableScroll();
                //     $location.search('');
                //
                //     analytics.trackPage('movies');
                // };
                //
                // $scope.showTrailer = function () {
                //     $scope.showingTrailer = true;
                //     $location.search('view', 'trailer');
                //
                //     analytics.trackEvent('Trailer', 'Tap', $scope.movie.title);
                //     analytics.trackPage('trailer');
                // };
                //
                // $scope.hideTrailer = function () {
                //     $scope.showingTrailer = false;
                //     $location.search('view', 'movie');
                //
                //     analytics.trackPage('detail');
                // };

                /*
                 * kick everything off
                 */
                getData();

                $analytics.trackPage('movies');
        }]);
}());
