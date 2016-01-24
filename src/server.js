import http from "http";
import https from "https";

http.globalAgent.maxSockets = 1024;
https.globalAgent.maxSockets = 1024;

let express = require('express');
let app = express();

//setup Database
let Database = require("./util/Database").init()

import { version } from "../config/version.json";

app.disable("x-powered-by");

import bodyParser from "body-parser";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

import routes from "./app/routes";
routes(app);

let Scraper = require('./util/Scraper');
Scraper.init()
Scraper.retrieve();

app.listen(ENV.NODE_PORT);

console.log(
  "server pid %s listening on port %s in %s mode",
  process.pid,
  ENV.NODE_PORT,
  ENV.NODE_ENV
);
