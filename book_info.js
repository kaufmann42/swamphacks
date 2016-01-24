const https = require('https');
const http = require('http');
const querystring = require('querystring');
const resemble = require('node-resemble-js');
const fs = require('fs');
var path = require('path');

var image1 = 'https://scontent-mia1-1.xx.fbcdn.net/hphotos-xfl1/v/t1.0-9/12552541_1190510354310388_8394298973295365965_n.jpg?oh=7755e987bdc6a0d5aa2c701dda6ced5f&oe=5700D084';
var image2 = 'https://books.google.com/books/content?id=3VOnAQAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api';

var request = https.get(image1, function(res){
    var imagedata = ''
    res.setEncoding('binary')

    res.on('data', function(chunk){
        imagedata += chunk
    })

    res.on('end', function(){
        fs.writeFile(path.join(__dirname, 'image1'), imagedata, 'binary', function(err){
            if (err) throw err;
            console.log('File saved.')
            comparePictures();
        })
    })

})

function comparePictures() {
  var api = resemble(path.join(__dirname, 'image1')).onComplete(function(data){
      console.log(data);
      /*
      {
        red: 255,
        green: 255,
        blue: 255,
        brightness: 255
      }
      */
  });
}

function findBookName(image_URL) {
  var result = '';
  var postData = querystring.stringify({
    "image_request[remote_image_url]": image_URL,
    "image_request[locale]": "en-US"
  });

  var options = {
    hostname: 'api.cloudsightapi.com',
    port: 443,
    path: '/image_requests',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length,
      'Authorization': 'CloudSight S-jZFO7UBX62m7SlbROdCA'
    }
  };

  var req = https.request(options, (res) => {
    // console.log(`STATUS: ${res.statusCode}`);
    // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      result += chunk;
      //console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
      var json = JSON.parse(result);
      findBookNameByToken(json.token);
      // console.log('No more data in response.');
    })
  });

  req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
  });

  // write data to request body
  req.write(postData);
  req.end();
}

function findBookNameByToken(token) {
  var options = {
    hostname: 'api.cloudsightapi.com',
    port: 443,
    path: '/image_responses/' + token,
    method: 'GET',
    headers: {
      'Authorization': 'CloudSight S-jZFO7UBX62m7SlbROdCA'
    }
  };

  https.get(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });
    res.on('end', function() {
      var json = JSON.parse(responseString);
      if (json.status == 'not completed') {
        setTimeout(findBookNameByToken(token), 12000);
      } else {
        findBook(json.name);
      }
    });
  });
}

function findBook(search) {
  search = search.replace(/^\s+|\s+$/g, '');
  search = search.replace(/\s+/g, '+');

  https.get('https://www.googleapis.com/books/v1/volumes?q=' + search + '&key=AIzaSyCoOosJQOiIzhkpRTno0fSbkYEmqpc3vcA', function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });
    res.on('end', function() {
      //console.log(responseString);
      var json = JSON.parse(responseString);
      for (var i = 0; i < 5; i++) {
        console.log(json["items"][i].volumeInfo);
      }
    });
  });
};

// findBookName('https://scontent-mia1-1.xx.fbcdn.net/hphotos-xfl1/v/t1.0-9/12552541_1190510354310388_8394298973295365965_n.jpg?oh=7755e987bdc6a0d5aa2c701dda6ced5f&oe=5700D084');
