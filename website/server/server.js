"use strict";
let fs = require("fs");
let path = require("path");

let Q = require("q");
let express = require("express");
let bodyParser = require("body-parser");
let restify = require("restify");

function Server() {
    Q.longStackSupport = true;
    this.__setup();
};

Server.prototype.__setup = function () {
    this.app = restify.createServer({ name: "BeaconSpam" });
    this.app.use(bodyParser.json());
    this.__setupRouting();
};

Server.prototype.listen = function() {
    console.log("Server started!");
    this.app.listen(8080);
};

Server.prototype.__setupRouting = function () {
    // Static files are added last as they match every request
    this.app.get(".*", restify.serveStatic({
        directory: "client/",
        default: "index.html"
    }));
};

module.exports = Server;
