var google = require('googleapis');
var youtube = google.youtube('v3');
var apiKey = require('./config.json').google.apiKey;
var Q = require('q');

function getYoutubeTrailerId(movieTitle) {
    var deferred = Q.defer();

    youtube.search.list({
        part: 'snippet',
        q: movieTitle + ' Trailer HD',
        maxResults: 1,
        key: apiKey
    }, function (err, result) {
        if (err) {
            console.log('Youtube error occurred: ', err);
            deferred.reject(err);
            return;
        }

        deferred.resolve(result.items[0].id.videoId);
    });

    return deferred.promise;
}

exports.getYoutubeTrailerId = getYoutubeTrailerId;
