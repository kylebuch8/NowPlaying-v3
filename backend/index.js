var gm = require('gm');
var fs = require('fs');
var http = require('http');
var output = __dirname + '/output.jpg';

http.get('http://content8.flixster.com/movie/11/18/14/11181426_det.jpg', function (res) {
    var data = '';

    res.setEncoding('binary');

    res.on('data', function (chunk) {
        data += chunk;
    });

    res.on('end', function () {
        fs.writeFileSync(output, data, 'binary');
        gm(output)
            .blur(40, 10)
            .write(__dirname + '/blur.jpg', function (error) {
                if (error) {
                    console.log(error);
                }
            });
    });
});
