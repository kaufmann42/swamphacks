import Database from "../../../util/Database";
import send from "../../../util/send";

let _ = require('underscore');

let getBook = function(bookId) {
	console.log(bookId);
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
		u.thumbnail_photo_URL AS user_thumbnail_photo_URL \
		FROM books b \
		LEFT JOIN users u ON u.id = b.creator_id \
		WHERE b.id = ?', bookId);
}

let formatJSON = function(results) {
  console.log(results);
  let bookResult = results[0];
  let userKeywords = ['first_name', 'last_name', 'phone', 'user_thumbnail_photo_URL'];
  var creator = {};

  for (var book in bookResult) {
	if (_.contains(userKeywords, book)) {
		creator[book] = bookResult[book];
		bookResult[book] = undefined;
	}
  }

  bookResult.creator = creator;

  return bookResult;
}

module.exports = function(req, res) {
	let bookId = req.params.bookId;

	getBook(req.params.bookId)
	 .then(formatJSON)
   .then(send.success(res))
   .catch(send.failure(res));
};