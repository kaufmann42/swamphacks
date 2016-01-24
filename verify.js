var fs = require('fs');
var https = require('https');
var gm = require('gm');

function getPictures(pictures) {
  for (var i in pictures) {
    var request = https.get(pictures[i], function(res){
        var imagedata = '';
        res.setEncoding('binary');

        res.on('data', function(chunk){
            imagedata += chunk;
        });

        res.on('end', function(){
            fs.writeFile('file'+i+'.png', imagedata, 'binary', function(err){
                if (err) throw err;
            });
        });

    });
  }
}

function savePictures(image1_URL, image2_URL) {
  var image1 = image1_URL;
  var image2 = image2_URL;
  var pictures = [image1, image2];
  getPictures(pictures);
  setTimeout(function () {
    testing();
  }, 5000);
}

function testing() {
  gm.compare('file0.png', 'file1.png', function (err, isEqual, equality, raw) {
  if (err) throw err;
    if (parseFloat(quality) < 0.10 ) {
      console.log("We're confident!");
    }
  });
}
