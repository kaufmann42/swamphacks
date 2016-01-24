import graph from "fbgraph";
import Database from "./Database";

let options = {
  timeout:  3000,
  pool: { maxSockets:  Infinity },
  headers:  { connection:  "keep-alive" }
};

let accessToken = "CAACEdEose0cBAM1wZCdo94JExGly1ZBzq9U83GRPNN9EZCouFtdtwjxWC2fzLhhZCCi4pDU3KGUJcXauvo1g7MHZC5JkZA55aMMCSmgLZCPZBBRPNfZCmeQbZB5kXgQ0NSZAvhkX6ZBFzdZBwqrvzEtP55gXo0qK0HoRb9pYtZBqPQtc6SCHs45Ect42xLB2FDDWneURORVePZCHa5D7AZDZD"
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

let handlePosts = function(results) {
  return Promise.all(results.map(function(result) {
    let insertId;
    return insertPost(result)
            .then(insertPostResults => {
              insertId = insertPostResults.insertId;
              return getObject(result.object_id);
            })
            .then(getObjectResults => {
              let coverPhotoURL = getObjectResults.source;
              return updateCoverPhotoInDatabase(insertId, coverPhotoURL)
            });
  }));
}

let insertPost = function(result) {
  let book = {
    facebook_object_id: result.object_id,
    creator_id: result.from.id,
    thumbnail_photo_URL: result.picture
  };

  let lines = result.message.split('\n');
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

let updateCoverPhotoInDatabase = function(postId, coverPhotoURL) {
  return Database.connection.query('UPDATE books SET cover_photo_URL = ? WHERE id=?', [coverPhotoURL, postId]);
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
        return handlePosts(resultsWithObjects);
      })
      .catch(error => {
        console.log("Error: ", error);
      })
  }
}

module.exports = Scraper;


