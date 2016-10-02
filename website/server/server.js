"use strict";
const CALCULATE_AFTER_MILLISECONDS = 700;

const fs = require("fs");
const path = require("path");

const Q = require("q");
const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const restify = require("restify");
const trilaterate = require('./maths/trilaterate');
const beaconDistanceCalculator = require('./maths/distance');
let beaconBlackboard = require('./beacon_blackboard');
let listeners = eval("new Object(" + fs.readFileSync('./../website/client/data/map.json') + ");").listeners;

function Server() {
    Q.longStackSupport = true;
    this.__setup();
};

Server.prototype.__setup = function () {
    this.app = restify.createServer({ name: "BeaconSpam" });
    this.app.use(bodyParser.json());
    this.app.use(session({
        secret: "beacon&spam",
        resave: false,
        saveUninitialized: true
    }));
    this.__setupRouting();
};

Server.prototype.listen = function() {
    console.log("Server started!");
    this.app.listen(8080);
};

let handleBeaconInfo = function (req, res) {
    /**
     * {
     *  listernerId: ...,
     *  beacon: {
     *      id: ....,
     *      name: ...,
     *      txPower: ....,
     *      samples: [{rssi: ...., timestamp: .....}]
     *  }
     * }
     */
    console.log('received', req.body.listenerId, new Date(req.body.beacon.samples[0].timestamp).toTimeString(), req.body.beacon.samples[0].rssi);
    var beaconData = {
        listenerId: req.body.listenerId,
        // Unify the id's received from PC and phones
        id: req.body.beacon.id.toLowerCase().replace(/:/g, ""),
        txPower: req.body.beacon.txPower,
        samples: req.body.beacon.samples
    };

    beaconBlackboard.addRaw(beaconData);

    res.send();
}

let sendBeaconData = function (req, res) {
    var alreadySent = beaconBlackboard.alreadySent[req.session.id] || 0;
    var data = beaconBlackboard.calculatedData.slice(alreadySent);
    beaconBlackboard.alreadySent[req.session.id] = Math.max(beaconBlackboard.calculatedData.length - 1, 0);
    res.send(data);
}

Server.prototype.__setupRouting = function () {
    this.app.post("/beacon/data", handleBeaconInfo);
    this.app.get("/beacon", sendBeaconData);

    // Static files are added last as they match every request
    this.app.get(".*", restify.serveStatic({
        directory: "client/",
        default: "index.html"
    }));
};

const calculatePositions = require("./calculate_positions");
setInterval(calculatePositions, CALCULATE_AFTER_MILLISECONDS);

module.exports = Server;
