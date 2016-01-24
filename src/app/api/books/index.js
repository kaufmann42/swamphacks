import Database from "../../../util/Database";
import send from "../../../util/send";

let _ = require('underscore');


let getAllBooks = function() {
	return Database.connection.query('SELECT \
    b.title, \
    b.course, \
    b.price, \
    b.quality, \
    b.phone, \
    b.thumbnail_photo_URL AS book_thumbnail_photo_URL, \
    b.cover_photo_URL, \
    u.first_name, \
    u.last_name, \
    u.thumbnail_photo_URL AS user_thumbnail_photo_URL, \
    u.id, \
    u.facebook_UID \
    FROM books b \
    LEFT JOIN users u ON u.id = b.creator_id \
    ');
}

let formatJSON = function(results) {
  let bookResults = results;

  let userKeywords = ['first_name', 'last_name', 'phone',
                      'user_thumbnail_photo_URL', 'facebook_UID', 'id'];

  for (var book in bookResults) {
    let creator = {};
    let res = bookResults[book];

    for (let r in res) {
      if (_.contains(userKeywords, r)) {
        creator[r] = res[r];
        res[r] = undefined;
      }
    }
    res.creator = creator;
  }


  return bookResults;
}

module.exports = function(req, res) {
	console.log('hi!');
	getAllBooks()
	 .then(formatJSON)
   .then(send.success(res))
   .catch(send.failure(res));
};