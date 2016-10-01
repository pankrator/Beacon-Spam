"use strict";

const _ = require("lodash");
const fs = require("fs");
const trilaterate = require('./maths/trilaterate');
const beaconDistanceCalculator = require('./maths/distance');
let beaconBlackboard = require('./beacon_blackboard');
let listeners = eval("new Object(" + fs.readFileSync('./../website/client/data/map.json') + ");").listeners;

const OUTLIERS_TIMESTAMP_TO_REMOVE = 6000;

module.exports = function () {
    let beaconListenerDistanceMap = {};
    let beaconPositions = {};
    //beaconListenerDistanceMap[b][l] = [{rssi, timestamp}];

    let groupedBeacons = _.groupBy(beaconBlackboard.rawData, "id");
    for (let beaconId in groupedBeacons) {
        if (groupedBeacons[beaconId].length < 4) {
            continue;
        }

        var beaconSignals = groupedBeacons[beaconId];
        beaconListenerDistanceMap[beaconId] = beaconSignals.reduce(function(prev, current) {
            prev[current.listenerId] = prev[current.listenerId] || [];
            for (const sample in current.samples) {
                prev[current.listenerId].push(sample);
            }
            return prev;
        }, {});

        for (let listenerId in beaconListenerDistanceMap[beaconId]) {
            beaconListenerDistanceMap[beaconId][listenerId] = beaconDistanceCalculator(beaconListenerDistanceMap[beaconId][listenerId], groupedBeacons[beaconId].txPower);
        }

        beaconPositions[beaconId] = calculatePosition(beaconListenerDistanceMap[beaconId]);
    }

    beaconBlackboard.calculatedData.push({
        timestamp: Date.now(),
        beaconPositions: beaconPositions
    });

    var now = Date.now();
    beaconBlackboard.rawData = beaconBlackboard.rawData.filter(function(data) {
        return !(data.samples.some(function(sample) {
            return now - sample.timestamp > OUTLIERS_TIMESTAMP_TO_REMOVE;
        }));
    });
}

let calculatePosition = function (beaconListenersDistance) {
    var distanceListenerPairs = [];
    for (let listenerId in beaconListenersDistance) {
        distanceListenerPairs.push({
            listenerId: listenerId,
            distance: beaconListenersDistance[listenerId]
        });
    }
    distanceListenerPairs.sort((a, b) => {
        return a.distance - b.distance;
    });

    distanceListenerPairs = distanceListenerPairs.slice(0, 4);


    // var data = [
    //     {
    //         p: P1,
    //         r: 5.36
    //     },
    //     {
    //         p: P3,
    //         r: 8.6
    //     },
    //     {
    //         p: P2,
    //         r: 7.28
    //     },
    //     {
    //         p: P4,
    //         r: 10
    //     }
    // ];
    let data = distanceListenerPairs.map(function(listenerData) {
        console.log("*****", listenerData.listenerId);
        return {
            p: listeners[listenerData.listenerId].location,
            r: listenerData.distance
        };
    });

    return trilaterate(data);
} 