import graph from "fbgraph";
import Database from "./Database";

let options = {
  timeout:  3000,
  pool: { maxSockets:  Infinity },
  headers:  { connection:  "keep-alive" }
};

let accessToken = "CAACEdEose0cBAHoPTeQtZAkwQdEsAu3Q0bHCTZAvQiIWc2lRdf0JUT5F3LI6y6x82ktnM9tGO9DZAehHaRF4Nt7pa8jcgkZBQit2X1E9wTytJmuaZBFYJBBWMM4phN49ArybZAdh2iiwwEZC7kM7ZADd1rtuZAkoLh3lIrZA8YVoDnVQSlANzGhcbyTeFGovmzcISGj9m9PnqYWQZDZD"
let groupId = "1550463375273041";

let getGroupFeed = function(groupId) {
  return new Promise(function(resolve, reject) {
    graph.get(groupId + '/feed', function(err, res) {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
};

let getFeedObjects = function(results) {
  return Promise.all(results.map(function(result) {
    return getObject(result.object_id)
          .then(object => insertObjectIntoDatabase(object))
  }));
}

let getObject = function(objectId) {
  return new Promise(function(resolve, reject) {
    graph.get(objectId, function(err, res) {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  })
}

let insertObjectIntoDatabase = function(object) {
  let book = {
    facebook_object_id: object.id,
    creator_id: object.from.id,
    cover_photo_URL: object.images[0].source
  };

  let lines = object.name.split('\n');
  lines.forEach(function(line) {
    let attribute = line.split(':');
    let keyword = attribute.shift();
    let description = attribute.join(':');

    switch (keyword.toLowerCase()) {
      case 'title':
        book.title = description;
        break;
      case 'course':
        book.course = description;
        break;
      case 'price':
        book.price = description;
        break;
      default:
        break;
    };
  });

  return Database.connection.query('INSERT INTO books SET ?', book);
}

let Scraper = {
  init: function() {
    graph
      .setAccessToken(accessToken)
      .setOptions(options)
  },
  retrieve: function() {
    getGroupFeed(groupId)
      .then(results => {
        let resultsWithObjects = results.data.filter(result => result.object_id !== undefined);
        return getFeedObjects(resultsWithObjects);
      })
      .catch(error => {
        console.log("Error: ", error);
      })
  }
}

module.exports = Scraper;


