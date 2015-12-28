var gm = require('gm');
var fs = require('fs');
var http = require('http');
var q = require('q');
var config = require('./config.json');
var AWS = require('aws-sdk');
var youtube = require('./youtube.js');
var posters = require('./posters.js');
var crontab = require('node-crontab');
var ColorThief = require('color-thief');
var colorThief = new ColorThief();
var SMALL_IMAGE_WIDTH = 180;
var LARGE_IMAGE_WIDTH = 420;

var openingUrl = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/opening.json?limit=3';
var inTheatersUrl = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json?limit=13';

AWS.config.update(config.aws);

var s3 = new AWS.S3();

function setMoviePosters(posters) {
    if (!posters) {
        return;
    }

    var regex = /[0-9]{2}x[0-9]{2}\//,
        url = 'http://' + posters.profile.split(regex)[1];

    /*
     * sometimes the url comes back in a format that i'm not
     * prepared to parse
     */
    if (url === 'http://undefined') {
        url = posters.profile;
    }

    posters.original = url;
    posters.profile = url;
    posters.detailed = url;
    posters.thumbnail = url;

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
            console.log('amazon s3 error');
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
            console.log('error uploading json to s3');
            console.log(err);
            deferred.reject(new Error(err));
            return;
        }

        deferred.resolve(resp);
    });

    return deferred.promise;
}

/*
 * functions we'll use with color thief
 */
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function getContrast50(hexcolor){
    hexcolor = hexcolor.replace('#', '');
    return (parseInt(hexcolor, 16) > 0xffffff/2) ? 'dark' : 'light';
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
    var colorThiefPromise = q.defer();
    var promises = [originalImagePromise.promise, blurredImagePromise.promise, colorThiefPromise.promise];
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

            var colors = colorThief.getPalette(output),
                rgb = colors[0],
                dominantColor = rgbToHex(rgb[0], rgb[1], rgb[2]),
                textColor = getContrast50(dominantColor);

            colorThiefPromise.resolve({
                dominantColor: dominantColor,
                textColor: textColor
            });

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
    }).on('error', function (error) {
        colorThiefPromise.reject();
        blurredImagePromise.reject();
        originalImagePromise.reject();
        console.log('error downloading image');
        console.log(posterUrl);
        console.log(error);
    });

    return q.all(promises);
}

function getAllMoviePosterUrls(movies) {
    return posters.getConfiguration().then(function () {
        var promises = [];

        movies.forEach(function (movie) {
            var deferred = q.defer();

            if (movie.alternate_ids) {
                posters.getMovieData(movie.alternate_ids.imdb).then(function (response) {
                    var movieResults = response.movie_results;
                    console.log(movieResults);

                    if (movieResults.length && movieResults[0].backdrop_path !== null && movieResults[0].poster_path !== null) {
                        var movieData = movieResults[0];
                        var backdropPath = movieData.backdrop_path;
                        var posterPath = movieData.poster_path;
                        var imageUrls = posters.buildImageUrls(backdropPath, posterPath);

                        movie.imageUrls = imageUrls;
                    }

                    deferred.resolve(movie);
                });
            } else {
                deferred.resolve(movie);
            }

            promises.push(deferred.promise);
        });

        return q.all(promises);
    });
}

function generateAllMoviePosters(movies) {
    var promises = [];

    movies.forEach(function (movie) {
        var deferred = q.defer(),
            smallPostersSaved = false,
            largePostersSaved = false;

        movie.images = {};
        //movie.posters = setMoviePosters(movie.posters);
        var movieUrl = (movie.imageUrls) ? movie.imageUrls.poster : movie.posters.detailed;

        /*
         * get the detailed posters
         */
        generatePosterImage(movieUrl, movie.id, SMALL_IMAGE_WIDTH).then(function (data) {
            movie.images.poster = data[0];
            movie.images.bg = data[1];
            movie.colors = data[2];

            smallPostersSaved = true;

            if (smallPostersSaved && largePostersSaved) {
                deferred.resolve(movie);
            }
        });

        /*
         * get the original posters
         */
        generatePosterImage(movieUrl, movie.id + '_lg', LARGE_IMAGE_WIDTH).then(function (data) {
            movie.images.poster_lg = data[0];
            movie.images.bg_lg = data[1];
            movie.colors = data[2];

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

function getMovies(url) {
    var deferred = q.defer();
    var rottenTomatoesApiKey = config.rottenTomatoes.apiKey;
    var timestamp = new Date().getTime();
    var rottenTomatoesInTheatersUrl = url + '&d=' + timestamp + '&apikey=' + rottenTomatoesApiKey;

    console.log(rottenTomatoesInTheatersUrl);

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

            /*
             * sort the movies by the theater release date
             * with the newest movies first
             */
            result.movies.sort(function (a, b) {
                return new Date(b.release_dates.theater) - new Date(a.release_dates.theater);
            });

            deferred.resolve(result);
        });
    }).on('error', function (error) {
        console.log('could not get movie data');
        console.log(error);
    });

    return deferred.promise;
}

function run () {
    var movies = [];

    getMovies(openingUrl)
        .then(function (result) {
            movies = movies.concat(result.movies);

            console.log('done getting opening movies');

            getMovies(inTheatersUrl).then(function (result) {
                movies = movies.concat(result.movies);

                console.log('done getting in theaters movies');

                /*
                 * only take the first 16 movies
                 */
                movies = movies.slice(0, 16);

                getAllMoviePosterUrls(movies).then(function () {
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
            });
        });
}

//var jobId = crontab.scheduleJob('0 1 * * *', run);
run();
