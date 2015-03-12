(function () {
    'use strict';

    /*global angular*/
    angular.module('services.movies', [])
        .factory('$movies', ['$http', '$q', function ($http, $q) {
            var moviesService = {
                    movies: []
                },
                selected,
                jsonUrl = 'https://s3.amazonaws.com/nowplaying-v3/nowplaying.json';

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

            /*
             * we'll need a refresh if there are no movies, or if there are
             * movies, the data needs to be less than 12 hours old
             */
            moviesService.needsRefresh = function () {
                var lastUpdated = localStorage.getItem('last-updated'),
                    movies = localStorage.getItem('movies'),
                    needsRefresh = true,
                    currentDate;

                if (!movies) {
                    return needsRefresh;
                }

                if (lastUpdated) {
                    currentDate = Date.now();
                    lastUpdated = new Date(parseInt(lastUpdated, 10));

                    /*
                     * less than 12 hours
                     */
                    if (((currentDate - lastUpdated) / 1000 / 60 / 60) < 12) {
                        needsRefresh = false;
                    }
                }

                return needsRefresh;
            };

            /*
             * get the movies and store them in local storage along
             * with a time stamp
             *
             * when we get the movies, if we have know when the movies
             * were last updated, let's find out if the data is more
             * than 12 hours old. if it is, get the data again
             */
            moviesService.get = function () {
                var lastUpdated = localStorage.getItem('last-updated'),
                    cachedMovies = localStorage.getItem('movies'),
                    deferred = $q.defer(),
                    currentDate;

                /*
                 * check to see if the data is more than less than 12
                 * hours old. if it is, return the cached data
                 */
                if (lastUpdated && cachedMovies) {
                    currentDate = Date.now();
                    lastUpdated = new Date(parseInt(lastUpdated, 10));

                    if (!moviesService.needsRefresh()) {
                        moviesService.movies = JSON.parse(cachedMovies);
                        deferred.resolve(moviesService.movies);

                        return deferred.promise;
                    }
                }

                /*
                 * get the data from amazon, figure out which image needs
                 * to be displayed based on screen size. set the movies and
                 * last updated date in local storage and return the movies.
                 */
                $http.get(jsonUrl)
                    .success(function (movies) {
                        movies.forEach(function (movie) {
                            var duration,
                                mql;

                            /*
                             * create a duration string for the view based
                             * on the duration. ex: 1h 40m
                             */
                            duration = getDuration(movie.runtime);
                            movie.duration = duration.hours + 'h ' + duration.minutes + 'm';

                            /*
                             * set the background images
                             */
                            mql = window.matchMedia('(min-width: 800px), (min-height: 800px)');
                            if (mql.matches) {
                                movie.images.poster = movie.images.poster_lg;
                                movie.images.bg = movie.images.bg_lg;
                            }
                        });

                        localStorage.setItem('movies', JSON.stringify(movies));
                        localStorage.setItem('last-updated', Date.now());

                        moviesService.movies = movies;

                        deferred.resolve(movies);
                    })
                    .error(function () {
                        deferred.reject();
                    });

                return deferred.promise;
            };

            moviesService.setSelected = function (id) {
                var index = moviesService.movies.map(function (movie) {
                    return movie.id;
                }).indexOf(id);

                selected = {
                    index: index,
                    movie: moviesService.movies[index]
                };
            };

            moviesService.getSelected = function () {
                return selected;
                var deferred = $q.defer();

                if (selected) {
                    deferred.resolve(selected);
                } else {
                    deferred.reject();
                }

                return deferred.promise;
            };

            return moviesService;
        }]);
}());
