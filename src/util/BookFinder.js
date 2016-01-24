const https = require('https');
const http = require('http');
const querystring = require('querystring');

function findBookName(image_URL) {
  return new Promise(function(resolve, reject) {
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
        resolve(json.token);
        // console.log('No more data in response.');
      })
    });

    req.on('error', (e) => {
      reject(e);
      console.log(`problem with request: ${e.message}`);
    });

    // write data to request body
    req.write(postData);
    req.end();
  })
}

function findBookNameByToken(token) {
  return new Promise(function(resolve, reject) {
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
          resolve(json.name);
        }
      });
    });
  })
}

function findBook(search) {
  return new Promise(function(resolve, reject) {
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
        console.log("Here's the JSON: ", json);
        resolve(json);
        for (var i = 0; i < 5; i++) {
          console.log(json["items"][i].volumeInfo);
        }
      });
    });
  })
};

let BookFinder = {
  search: function(imageURL) {
    return findBookName(imageURL)
      .then(token => {
        console.log("token received: ", token);
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            resolve(findBookNameByToken(token));
          }, 50000);
        });
      })
      .then(name => {
        console.log("name received: ", name);
        return findBook(name)
      })
      .catch(error => {
        console.log("Error received: ", error);
      })
  }
}

module.exports = BookFinder;