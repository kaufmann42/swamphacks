module.exports = function(app) {
	app.get('/api/books/', require('./api/books/index'));
	app.get('/api/books/:bookId', require('./api/books/show'));

	app.get('/api/courses', require('./api/courses/index'));

	app.get('/api/users/', require('./api/users/index'));
}