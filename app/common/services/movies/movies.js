(function () {
    'use strict';

    /*global angular*/
    angular.module('services.movies', [])
        .factory('movies', ['$http', '$q', function ($http, $q) {
            var moviesService = {},
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

                    if (((currentDate - lastUpdated) / 1000 / 60 / 60) < 12) {
                        deferred.resolve(JSON.parse(cachedMovies));
                        return deferred.promise;
                    }
                }

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

                        deferred.resolve(movies);
                    })
                    .error(function () {
                        deferred.reject();
                    });

                return deferred.promise;
            };

            return moviesService;
        }]);
}());
