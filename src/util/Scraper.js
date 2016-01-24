import graph from "fbgraph";
import Database from "./Database";
import BookFinder from "./BookFinder"

let options = {
  timeout:  3000,
  pool: { maxSockets:  Infinity },
  headers:  { connection:  "keep-alive" }
};

let accessToken = 'CAACEdEose0cBADYf5Tl7gt5ZATAcq8q3xOLSsbGAQjModaoXlZBEETWdTSpi9skmAEQmCbxrU0upAaRpEyO5JyZBknU1mkzZBdZA0pTeZBmMsbS4fm0hDX9ugseacnjMhe8ZBHafiNxcwXyhzZAwlKZCs5oD3gBq2OY8LNLhAD9herIqv7tYA4MGRXKtfiRbOHwTWZA17WiDaAzAZDZD';
let groupId = '1550463375273041';

let getGroupFeed = function(groupId) {
  return new Promise(function(resolve, reject) {
    graph.get(groupId + '/feed', function(err, res) {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
}

let insertPostCreator = function(facebookUID) {
  return Promise.all([getPostCreatorBasicInfo(facebookUID), getPostCreatorProfilePicture(facebookUID)])
    .then(results => {
      let user = {
        facebook_UID: facebookUID,
        first_name: results[0].first_name,
        last_name: results[0].last_name,
        thumbnail_photo_URL: results[1]
      }

      return Database.connection.query('INSERT INTO users SET ? ON DUPLICATE KEY UPDATE facebook_UID = facebook_UID', user);
    });
}

let getPostCreator = function(facebookUID) {
  return Database.connection.query('SELECT * FROM users WHERE facebook_UID = ? LIMIT 1', facebookUID);
}

let getPostCreatorBasicInfo = function(creatorId) {
  return new Promise(function(resolve, reject) {
    graph.get(creatorId, function(err, res) {
      if (err) {
        return reject(err);
      }

      resolve(res);
    });
  });
}

let getPostCreatorProfilePicture = function(creatorId) {
  return new Promise(function(resolve, reject) {
    graph.get(creatorId + '/picture/', function(err, res) {
      if (err) {
        return reject(err);
      }
      resolve(res.location);
    });
  });
}

let handlePosts = function(results) {
  return Promise.all([results.map(function(result) {
    let resultsFromId = result.from.id;
    insertPostCreator(resultsFromId)
      .then(() => getPostCreator(resultsFromId))
      .then(postCreatorResults => {
        let creatorId = postCreatorResults[0].id;
        return Promise.all([insertPost(creatorId, result), getObject(result.object_id)])
          .then(promiseResults => {
            let insertId = promiseResults[0].insertId;
            let coverPhotoURL = promiseResults[1].source;
            if (insertId !== undefined) {
              return updateCoverPhotoInDatabase(insertId, coverPhotoURL)
            }
          });
      });
    })]);
}

let insertPost = function(creatorId, result) {
  let book = {
    creator_id: creatorId,
    facebook_object_id: result.object_id,
    thumbnail_photo_URL: result.picture,
  };

  // Check if user has inputted text
  if (result.message !== undefined) {
    let lines = result.message.split('\n');
    lines.forEach(function(line) {
      let attribute = line.split(':');
      let keyword = attribute.shift();
      let description = attribute.join(':');
      // Value may have extra whitespace, if so, remove it
      if (description.charAt(0) === ' ')
        description = description.substring(1)
      switch (keyword.toLowerCase()) {
        case 'title':
          book.title = description;
          break;
        case 'course':
          let coursePattern = new RegExp('\\w{3}\\d{4}', 'g');
          let matches = coursePattern.exec(description);
          book.course = matches[0].toUpperCase();
          break;
        case 'quality':
          book.quality = description;
        case 'price':
          // Get rid of '$', if user entered it
          if (description.indexOf('$') !== -1)
            book.price = description.split('$')[1];
          else
            book.price = description;
          break;
        case 'phone':
          var phoneNumberPattern = new RegExp("\\(?(\\d{3})\\)?\\-?(\\d{3})\\-?(\\d{4})", "g");
          var matches = phoneNumberPattern.exec(description);
          matches = matches.filter(function(elem, index) {
            if (index > 0 && index <= 3) return true;
            return false;
          });
          book.phone = matches.join('');
          break;
        default:
          break;
      };
    });
    return Database.connection.query('INSERT INTO books SET ? ON DUPLICATE KEY UPDATE ?', [book, book]);
  } else {
    return Database.connection.query('SELECT * FROM books WHERE facebook_object_id=?', book.facebook_object_id)
      .then(results => {
        if (results.length > 0) {
          return;
        }

        return BookFinder.search(book.thumbnail_photo_URL)
          .then(bookFinderResults => {
            let bookInfo = bookFinderResults.items[0].volumeInfo
            book.title = bookInfo.title;
            book.author = bookInfo.author[0];
            book.isbn = bookInfo.industryIdentifiers[0].identifier;
            console.log(book);
            return Database.connection.query('INSERT INTO books SET ? ON DUPLICATE KEY UPDATE ?', [book, book]);
          });
      });
  }
}

/**
 * Retreive the photo post for a post in the group feed
 * @param String - objectID of the photo post
 * @return Type - Descp
 */
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

/**
 * Update the cover photo (high-res) of a post in the database
 * @param String - Id of the post
 * @param String - URL of the high-rest photo
 * @return Type - Descp
 */
let updateCoverPhotoInDatabase = function(postId, coverPhotoURL) {
  return Database.connection.query('UPDATE books SET cover_photo_URL = ? WHERE id = ?', [coverPhotoURL, postId]);
}

let Scraper = {
  init: function() {
    graph
      .setAccessToken(accessToken)
      .setOptions(options)
  },
  retrieve: function() {
    getGroupFeed(groupId)
      .then(posts => {
        let postsWithObjects = posts.data.filter(result => result.object_id !== undefined);
        return handlePosts(postsWithObjects);
      })
      .catch(error => {
        console.log("Error: ", error);
      });
  }
}

module.exports = Scraper;