var resemble = require('../resemble.js');
var fs = require('fs');
var https = require('https');
var gm = require('gm');

var image1 = 'https://scontent-mia1-1.xx.fbcdn.net/hphotos-xfl1/v/t1.0-9/12552541_1190510354310388_8394298973295365965_n.jpg?oh=7755e987bdc6a0d5aa2c701dda6ced5f&oe=5700D084';
var image2 = 'https://books.google.com/books/content?id=3VOnAQAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api';
var pictures = [image1, image2];
var i = 0;

function getPictures(pictures) {
  var end = 0;
  for (var i in pictures) {
    end = i;
    var file = fs.createWriteStream("file"+i+".jpg");
    var request = https.get(pictures[i], function(response) {
      response.pipe(file);
      res.on('end', function(err) {
        if (err) throw err;
        if (end = 1) testing();
      });
    });
  }
}

function testing() {
  gm.compare('file0.png', 'People1.png', function (err, isEqual, equality, raw) {
  if (err) throw err;
  console.log(equality);
});
}

getPictures();
