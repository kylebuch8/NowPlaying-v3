var gm = require('gm');
var fs = require('fs');
var http = require('http');
var q = require('q');
var config = require('./config.json');
var AWS = require('aws-sdk');
var youtube = require('./youtube.js');

AWS.config.update(config.aws);

var s3 = new AWS.S3();

function setMoviePosters(posters) {
    if (!posters) {
        return;
    }

    posters.profile = posters.profile.replace('_tmb', '_pro');
    posters.detailed = posters.detailed.replace('_tmb', '_det');
    posters.original = posters.original.replace('_tmb', '_ori');

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

/*
 * 1. download the image first and write it locally
 * 2. upload the original to amazon
 * 3. blur original and add opacity layer
 * 4. upload the blurred image to amazon
 */
function generatePosterImage(posterUrl, fileName) {
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
                        filesize = format.Filesize;

                    gm(output)
                        .blur(10, 2)
                        .fill('#00000099')
                        .drawRectangle(0, 0, size.width, size.height)
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
        var deferred = q.defer();

        movie.posters = setMoviePosters(movie.posters);
        generatePosterImage(movie.posters.detailed, movie.id).then(function (data) {
            movie.images = {
                poster: data[0],
                bg: data[1]
            };

            deferred.resolve(movie);
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
    var rottenTomatoesInTheatersUrl = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json?apikey=' + rottenTomatoesApiKey;

    http.get(rottenTomatoesInTheatersUrl, function (res) {
        var data = '';

        res.on('data', function (chunk) {
            data += chunk;
        });

        res.on('end', function () {
            var result = JSON.parse(data);

            deferred.resolve(result);
        });
    });

    return deferred.promise;
}

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
        });
});
