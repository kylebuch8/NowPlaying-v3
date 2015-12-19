var config = require('./config.json');
var request = require('request');
var q = require('q');
var configurationUrl = 'http://api.themoviedb.org/3/configuration?api_key=' + config.movieDb.apiKey;
var findUrl = 'https://api.themoviedb.org/3/find/';
var imageUrlBase;

var getConfiguration = function () {
    var deferred = q.defer();

    request(configurationUrl, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var data = JSON.parse(body);
            imageUrlBase = data.images.base_url + 'original';

            deferred.resolve(data);
        } else {
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

var getMovieData = function (movieId) {
    var deferred = q.defer();

    request(findUrl + 'tt'+ movieId + '?external_source=imdb_id&api_key=' + config.movieDb.apiKey, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            deferred.resolve(JSON.parse(body));
        } else {
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

var buildImageUrls = function (backdropPath, posterPath) {
    return {
        backdrop: imageUrlBase + backdropPath,
        poster: imageUrlBase + posterPath
    };
};

// getConfiguration().then(function (response) {
//     imageUrlBase = response.images.base_url + 'original';
// }).then(function () {
//     return getMovieData('tt0266543');
// }).then(function (response) {
//     var movie = response.movie_results[0];
//     var backdropPath = movie.backdrop_path;
//     var posterPath = movie.poster_path;
//     var imageUrls = buildImageUrls(backdropPath, posterPath);
//
//     console.log(imageUrls);
// });

exports.getConfiguration = getConfiguration;
exports.getMovieData = getMovieData;
exports.buildImageUrls = buildImageUrls;
