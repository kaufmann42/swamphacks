import Database from "../../../util/Database";
import send from "../../../util/send";

let getBook = function(bookId) {
	console.log(bookId);
	return Database.connection.query('SELECT \
		b.title, \
		b.course, \
		b.price, \
		b.quality, \
		b.phone, \
		b.thumbnail_photo_URL, \
		b.cover_photo_URL, \
		u.first_name, \
		u.last_name \
		FROM books b \
		LEFT JOIN users u ON u.id = b.creator_id \
		WHERE b.id = ?', [bookId]);
}

let formatJSON = function(results) {
  console.log(results);
  let bookResult = results;

  var creator = {};
  for (var book in bookResult) {
    console.log(bookResult[book]);
  }

  return bookResult;
}

module.exports = function(req, res) {
	let bookId = req.params.bookId;

	getBook(req.params.bookId)
	 .then(formatJSON)
   .then(send.success(res))
   .catch(send.failure(res));
};