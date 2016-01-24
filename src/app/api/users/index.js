import Database from "../../../util/Database";
import send from "../../../util/send";

let getAllUsers = function() {
	return Database.connection.query('SELECT * FROM users');
}

let formatJSON = function(results) {
  let userResults = results;

  for (var user in userResults) {
    console.log(userResults[user]);
  }

  return userResults;
}

module.exports = function(req, res) {
	console.log('hi!');
	getAllUsers()
	 .then(formatJSON)
   .then(send.success(res))
   .catch(send.failure(res));
};