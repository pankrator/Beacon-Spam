"use strict";
const CALCULATE_AFTER_MILLISECONDS = 700;

const fs = require("fs");
const path = require("path");

const DAILY_ATTENDANCE = require("./bootstrap_data/daily.json").daily;
const ATTENDANCE = require("./bootstrap_data/attendance.json").attendance;

const Q = require("q");
const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const restify = require("restify");
const trilaterate = require('./maths/trilaterate');
const tsp = require('./maths/tsp.js');
const beaconDistanceCalculator = require('./maths/distance');
let beaconBlackboard = require('./beacon_blackboard');
let listeners = eval("new Object(" + fs.readFileSync('./../website/client/data/map.json') + ");").listeners;
let places = eval("new Object(" + fs.readFileSync('./../website/client/data/map.json') + ");").places;

DAILY_ATTENDANCE.forEach(function(daily) {
    beaconBlackboard.add({
        beaconId: daily.beaconId,
        listenerId: daily.listenerId,
        timestamp: new Date(daily.timestamp).getTime()
    });
});

ATTENDANCE.forEach(function(visit) {
    beaconBlackboard.add({
        beaconId: visit.beaconId,
        listenerId: visit.listenerId,
        timestamp: new Date(visit.timestamp).getTime()
    });
});

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
    let now = Date.now();
    let shouldNotAccept = beaconData.samples.some(function(sample) {
        return now - sample.timestamp > 4000;
    });
    if (shouldNotAccept) {
        return res.send();
    }

    let distanceToListener = beaconDistanceCalculator(beaconData.samples, beaconData.txPower);
    if (distanceToListener < 1.5) {
        beaconBlackboard.add({
            listenerId: beaconData.listenerId,
            beaconId: beaconData.id,
            timestamp: beaconData.samples[beaconData.samples.length - 1].timestamp
        });
    }
    res.send();
}

let sendBeaconData = function (req, res) {
    var alreadySent = beaconBlackboard.alreadySent[req.session.id] || 0;
    alreadySent = 0;
    var data = beaconBlackboard.calculatedData.slice(alreadySent);
    beaconBlackboard.alreadySent[req.session.id] = Math.max(beaconBlackboard.calculatedData.length, 0);
    // console.log('DATA', alreadySent, beaconBlackboard.calculatedData.length, JSON.stringify(data));
    res.send(data);
}

const products = {
    "Beer" : "Alcohol",
    "Vodka" : "Alcohol",
    "Laptop" : "Tech",
    "Cookies" : "Bakery",
    "Bread" : "Bakery",
    "Headphones" : "Tech",
    "Baby Food" : "Babyfood",
};

let pathByProducts = function(req, res) {
    let selectedProducts = req.body;
    let placesToVisit = {"Scene": places.filter(function(pl) { return pl.name === "Scene";})[0].rects[0]};


    //console.log(selectedProducts)
    //console.log("places", placesToVisit)
    for(let i in selectedProducts) {
        let pr = selectedProducts[i]
        let locationName = products[pr]
        if (!placesToVisit.hasOwnProperty(locationName)) {
            //console.log("pr", pr)
            //console.log("place",locationName)
            placesToVisit[locationName] = places.filter(function(pl) { return pl.name === locationName;})[0].rects[0];
        }
    }

    tsp.getRouteByCoords(placesToVisit, function(route) {
        res.send(route);
    })
}

Server.prototype.__setupRouting = function () {
    this.app.post("/beacon/data", handleBeaconInfo);
    this.app.get("/beacon", sendBeaconData);
    this.app.get("/products", function (req, res) {
        res.send(Object.keys(products));
    })
    this.app.post("/path", pathByProducts);


    // Static files are added last as they match every request
    this.app.get(".*", restify.serveStatic({
        directory: "client/",
        default: "index.html"
    }));
};

module.exports = Server;
