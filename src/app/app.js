"use strict";

import express from "express";
import bodyParser from "body-parser"
import routes from "./routes";

export default function createAppMiddleware(environment) {
  var app = express();

  app.disable("x-powered-by");

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  routes(app);

  // Application and routers etc here

  return app;
}
