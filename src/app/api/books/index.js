import Database from "../../../util/Database";
import send from "../../../util/send";

let getAllBooks = function() {
	return Database.connection.query('SELECT * FROM books');
}

let formatJSON = function(results) {
  let bookResults = results;

  for (var book in bookResults) {
    console.log(bookResults[book]);
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