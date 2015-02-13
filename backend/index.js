var gm = require('gm');
var fs = require('fs');
var http = require('http');
var output = __dirname + '/output.jpg';

http.get('http://content9.flixster.com/movie/11/18/98/11189899_det.jpg', function (res) {
    var data = '';

    res.setEncoding('binary');

    res.on('data', function (chunk) {
        data += chunk;
    });

    res.on('end', function () {
        fs.writeFileSync(output, data, 'binary');
        gm(output)
            .identify(function (err, format) {
                var size = format.size;

                gm(output)
                    .blur(10, 2)
                    .fill('#00000099')
                    .drawRectangle(0, 0, size.width, size.height)
                    .write(__dirname + '/blur.jpg', function (error) {
                        if (error) {
                            console.log(error);
                        }
                    });
            })
    });
});
