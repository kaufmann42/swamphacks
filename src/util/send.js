'use strict';

function setSvgHeaders(response) {
    response.header('Content-Type', 'image/svg+xml');
}

var TEMPORARY_REDIRECT = 302;

var send = {
  failure: function(response) {
    return function(error) {
      var statusCode = error.statusCode || 500;

      if (statusCode === TEMPORARY_REDIRECT && error.body && error.body.value) {
          response.status(200).json(error.body.value);
          return;
      }

      console.error(error.stack);

      response.status(statusCode).json({
        message: error.message
      });
    };
  },

  success: function(response) {
    return function(data) {
      response.status(200).json(data);
    };
  },

  svg: {

    failure: function(response) {
      setSvgHeaders(response);

      return function(e) {
          console.error(e.stack);
          
          response.status(500).send();
      };
    },

    success: function(response) {
      setSvgHeaders(response);

      return function(svg) {
        response.status(200).send(svg);
      };
    }

  }

};

module.exports = send;
