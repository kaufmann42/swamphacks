"use strict";

var env = require("./lib/env");

// Load environment before doing anything
require("dotenv").load();

// All configs MUST come from environment variable
module.exports = {
    NODE_ENV: env.get("NODE_ENV"),
    NODE_PORT: env.get("NODE_PORT"),
    DATABASE_PASSWORD: "91zFzVoh"
};
