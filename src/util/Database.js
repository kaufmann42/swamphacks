import mysql from 'promise-mysql';

let Database = {
  connection: null,

  init: function() {
    mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'SwampHacks'
    }).then(function(conn){
      Database.connection = conn;
    });
  }
};

module.exports = Database;