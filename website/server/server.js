"use strict";
let fs = require("fs");
let path = require("path");

let Q = require("q");
let express = require("express");
let bodyParser = require("body-parser");
let restify = require("restify");
let beaconBlackboard = require('./beacon_blackboard');

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

let handleBeaconInfo = function (req, res) {
    /**
     * {
     *  id: ....,
     *  name: ...,
     *  txPower: ....,
     *  samples: [{rssi: ...., timestamp: .....}]
     * }
     */
    var beaconData = {
        id: req.body.id,
        name: req.body.name,
        txPower: req.body.txPower,
        samples: req.body.samples
    }
    beaconBlackboard.add(beaconData);
    res.send();
}

Server.prototype.__setupRouting = function () {
    this.app.post("/beacon/data", handleBeaconInfo);

    // Static files are added last as they match every request
    this.app.get(".*", restify.serveStatic({
        directory: "client/",
        default: "index.html"
    }));
};

module.exports = Server;
