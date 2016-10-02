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

        var beaconSignals = groupedBeacons[beaconId];
        beaconListenerDistanceMap[beaconId] = beaconSignals.reduce(function(prev, current) {
            if (!listeners[current.listenerId]) {
                const errorMessage = `Received data about an unknown listener: ${current.listenerId}!
                Known listeners are: ${Object.keys(listeners)}`;
                console.error(errorMessage);
                return prev;
            }
            console.log("SAMPLESZ:", current.listenerId, current.samples);
            prev[current.listenerId] = prev[current.listenerId] || [];
            for (const sample of current.samples) {
                prev[current.listenerId].push(sample);
            }
            return prev;
        }, {});
        
        console.log("LISTENERZ: ", Object.keys(beaconListenerDistanceMap[beaconId]).length );
        console.log("LISTENERZ: TXPOWE", groupedBeacons[beaconId][0].txPower);
        if (Object.keys(beaconListenerDistanceMap[beaconId]).length < 4) {
            continue;
        }
        console.log("hooray, 4 listeners!", groupedBeacons[beaconId]);

        for (let listenerId in beaconListenerDistanceMap[beaconId]) {
            beaconListenerDistanceMap[beaconId][listenerId] = beaconDistanceCalculator(beaconListenerDistanceMap[beaconId][listenerId],
                                                                                       groupedBeacons[beaconId][0].txPower);
        }

        console.log("YYY", beaconListenerDistanceMap[beaconId]);
        beaconPositions[beaconId] = calculatePosition(beaconListenerDistanceMap[beaconId]);
    }
    if (Object.keys(beaconPositions).length === 0) {
        return;
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
    console.log("XXXX", beaconListenersDistance);
    for (let listenerId in beaconListenersDistance) {
        console.log("UUU dszt", beaconListenersDistance);
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
    console.log("YYYY", listeners);
    let data = distanceListenerPairs.map(function(listenerData) {
        
        console.log("zzzzz", listenerData.listenerId);
        return {
            p: listeners[listenerData.listenerId].location,
            r: listenerData.distance,
            id: listenerData.listenerId
        };
    });
    data.forEach(d => {
        console.log('DATA', d.id, d.r);
    });
    let spartaa = trilaterate(data);
    console.log("TRILARZ", spartaa);
    return spartaa;
} 