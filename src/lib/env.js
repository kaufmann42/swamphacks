"use strict";

function envFor(name) {
    return process.env[name];
}

var env = {

    isTrue: function(name) {
        return envFor(name) === "true";
    },

    isFalse: function(name) {
        return envFor(name) === "false";
    },

    number: function(name, radix) {
        return parseInt(envFor(name), radix || 10);
    },

    array: function(name, separator) {
        return (envFor(name) || "").split(separator || ",");
    },

    get: function(name) {
        return envFor(name);
    }

};

module.exports = env;
