import Database from "../../../util/Database";
import send from "../../../util/send";

let _ = require('underscore');

let getAllCoures = function() {
	return Database.connection.query('SELECT course FROM books');
}

let formatJSON = function(results) {
  let courses = results;
  let cArray = [];

  for (let c in courses) {
    cArray.push(courses[c].course);
  }

  var seen = [];
  cArray = _.filter(cArray, function(elem) {
    return seen.hasOwnProperty(elem) ? false : (seen[elem] = true);
  });

  let jsonArgObjs = [];

  for (let i = 0; i < cArray.length; i++) {
    jsonArgObjs[i] = new Object();
    jsonArgObjs[i].course = cArray[i];
  }

  return JSON.parse(JSON.stringify(jsonArgObjs));
}

module.exports = function(req, res) {
	console.log('hi!');

	getAllCoures()
	 .then(formatJSON)
   .then(send.success(res))
   .catch(send.failure(res));
};