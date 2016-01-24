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
        console.log(err);
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
  console.log(object);

  let keywords = [
    "title:",
    "Title:",
    "course:",
    "Course:"
  ];

  // let currentWord = "";
  // for (var i=0; i<object.title.length; i++ {
  //   if currentWord
  //     title = title


  // }

  let book = {
    creator_id: object.from.id,
    facebook_object_id: object.id,
    course: "COP4600",
    price: 45,
    imageURL: object.images[0].source
  };
  book.title = object.name.split('\n')[0].substring(7);
  // for (var keyword in keywords) {
  //   console.log(keywords[keyword]);
  //   console.log(object.name.split(keywords[keyword]));

  // }
  console.log(object.name);



  return "";
  // return Database.connection.query('INSERT INTO books SET ?', book);
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
    });
  }
}

module.exports = Scraper;