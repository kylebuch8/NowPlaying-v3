var gm = require('gm');
var fs = require('fs');
var http = require('http');
var q = require('q');
var config = require('./config.json');
var AWS = require('aws-sdk');
var youtube = require('./youtube.js');
var crontab = require('node-crontab');
var SMALL_IMAGE_WIDTH = 180;
var LARGE_IMAGE_WIDTH = 420;

AWS.config.update(config.aws);

var s3 = new AWS.S3();

function setMoviePosters(posters) {
    if (!posters) {
        return;
    }

    var regex = /[0-9]{2}x[0-9]{2}\//,
        url = 'http://' + posters.profile.split(regex)[1];

    posters.original = url;
    posters.profile = url.replace('_ori', '_pro');
    posters.detailed = url.replace('_ori', '_det');
    posters.thumbnail = url.replace('_ori', '_tmb');

    return posters;
}

function uploadImage(dataObj) {
    var deferred = q.defer();

    var data = {
        Bucket: 'nowplaying-v3',
        Key: dataObj.fileName,
        Body: dataObj.buffer,
        ContentType: 'jpg'
    };

    s3.putObject(data, function (err, resp) {
        if (err) {
            console.log(err);
            deferred.reject(new Error(err));
            return;
        }

        deferred.resolve(resp);
    });

    return deferred.promise;
}

function uploadJson(json) {
    var deferred = q.defer();

    var data = {
        Bucket: 'nowplaying-v3',
        Key: 'nowplaying.json',
        Body: JSON.stringify(json),
        ContentType: 'application/json'
    };

    s3.putObject(data, function (err, resp) {
        if (err) {
            console.log(err);
            deferred.reject(new Error(err));
            return;
        }

        deferred.resolve(resp);
    });

    return deferred.promise;
}

/*
 * 1. download the image first and write it locally
 * 2. upload the original to amazon
 * 3. blur original and add opacity layer
 * 4. upload the blurred image to amazon
 */
function generatePosterImage(posterUrl, fileName, width) {
    var originalImagePromise = q.defer();
    var blurredImagePromise = q.defer();
    var promises = [originalImagePromise.promise, blurredImagePromise.promise];
    var output = __dirname + '/images/' + fileName + '.jpg';
    var blurredOutput = __dirname + '/images/' + fileName + '_blur.jpg';

    http.get(posterUrl, function (res) {
        var data = '';

        res.setEncoding('binary');

        res.on('data', function (chunk) {
            data += chunk;
        });

        res.on('end', function () {
            fs.writeFileSync(output, data, 'binary');
            gm(output)
                .resize(width)
                .stream(function (err, stdout, stderr) {
                    var buffer = new Buffer(0);

                    stdout.on('data', function (d) {
                        buffer = Buffer.concat([buffer, d]);
                    });

                    stdout.on('end', function () {
                        uploadImage({
                            fileName: fileName + '.jpg',
                            buffer: buffer
                        }).then(function (data) {
                            originalImagePromise.resolve('https://s3.amazonaws.com/nowplaying-v3/' + fileName + '.jpg');
                        });
                    });
                })
                .identify(function (err, format) {
                    var size = format.size,
                        filesize = format.Filesize,
                        secondBlurValue = (width === LARGE_IMAGE_WIDTH) ? 5 : 3;

                    gm(output)
                        .fill('#0000007F')
                        .drawRectangle(0, 0, size.width, size.height)
                        .resize(width)
                        .blur(30, secondBlurValue)
                        .stream(function (err, stdout, stderr) {
                            var buffer = new Buffer(0);

                            stdout.on('data', function (d) {
                                buffer = Buffer.concat([buffer, d]);
                            });

                            stdout.on('end', function () {
                                uploadImage({
                                    fileName: fileName + '_blur.jpg',
                                    buffer: buffer
                                }).then(function (data) {
                                    blurredImagePromise.resolve('https://s3.amazonaws.com/nowplaying-v3/' + fileName + '_blur.jpg');
                                });
                            });
                        });
                });
        });
    });

    return q.all(promises);
}

function generateAllMoviePosters(movies) {
    var promises = [];

    movies.forEach(function (movie) {
        var deferred = q.defer(),
            smallPostersSaved = false,
            largePostersSaved = false;

        movie.images = {};
        movie.posters = setMoviePosters(movie.posters);

        /*
         * get the detailed posters
         */
        generatePosterImage(movie.posters.detailed, movie.id, SMALL_IMAGE_WIDTH).then(function (data) {
            movie.images.poster = data[0];
            movie.images.bg = data[1];

            smallPostersSaved = true;

            if (smallPostersSaved && largePostersSaved) {
                deferred.resolve(movie);
            }
        });

        /*
         * get the original posters
         */
        generatePosterImage(movie.posters.original, movie.id + '_lg', LARGE_IMAGE_WIDTH).then(function (data) {
            movie.images.poster_lg = data[0];
            movie.images.bg_lg = data[1];

            largePostersSaved = true;

            if (smallPostersSaved && largePostersSaved) {
                deferred.resolve(movie);
            }
        });

        promises.push(deferred.promise);
    });

    return q.all(promises);
}

function getYoutubeMovieIds(movies) {
    var promises = [];

    movies.forEach(function (movie) {
        var deferred = q.defer();

        youtube.getYoutubeTrailerId(movie.title).then(function (youtubeId) {
            movie.youtubeId = youtubeId;
            deferred.resolve(movie);
        });

        promises.push(deferred.promise);
    });

    return q.all(promises);
}

function getMovies() {
    var deferred = q.defer();
    var rottenTomatoesApiKey = config.rottenTomatoes.apiKey;
    var timestamp = new Date().getTime();
    var rottenTomatoesInTheatersUrl = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json?d=' + timestamp + '&apikey=' + rottenTomatoesApiKey;

    http.get(rottenTomatoesInTheatersUrl, function (res) {
        var data = '';

        res.on('data', function (chunk) {
            data += chunk;
        });

        res.on('end', function () {
            var result = JSON.parse(data);

            /*
             * loop through all of the movies and check for a negative
             * critics_score value in the ratings object. set it to N/A
             * if the value is -1
             */
            result.movies.forEach(function (movie) {
                if (movie.ratings.critics_score === -1) {
                    movie.ratings.critics_score = 'N/A';
                } else {
                    movie.ratings.critics_score += '%';
                }
            });

            deferred.resolve(result);
        });
    });

    return deferred.promise;
}

function run () {
    getMovies().then(function (result) {
        var movies = result.movies;

        generateAllMoviePosters(movies)
            .then(getYoutubeMovieIds)
            .then(function (movies) {
                var output = __dirname + '/data.json';

                fs.writeFile(output, JSON.stringify(movies, null, 4), function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    console.log('JSON saved to ' + output);
                });

                uploadJson(movies).then(function (data) {
                    console.log('JSON saved to S3');
                });
            });
    });
}

var jobId = crontab.scheduleJob('0 1 * * *', run);
run();
