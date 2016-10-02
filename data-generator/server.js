'use strict';

const request = require('request');

// Taken from stackoverflow; not actual guid http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};

let rssiSignals = [-62,-57,-68,-64,-67,-69,-67,-77,-71,-71,-62,-63,-81,-73,-76,-72,-81,-86,-76,-82,-80,-86,-77,-81,-84,-87,-87,-89,-80,-81,-85,-81,-77,-80,-74,-76,-83,-73,-81,-71,-76,-74,-79,-80,-80,-72,-75,-71,-71,-70,-67,-73,-67,-63,-64,-70,-67,-69,-63,-73,-70,-60,-66,-65,-66,-71,-61,-57,-57,-60,-61,-64,-59,-65,-58,-64,-59,-58,-58,-59,-58,-58,-62,-58,-59,-63,-60,-63,-59,-59,-57,-60,-58,-62,-58];
rssiSignals = rssiSignals.filter(s => s < -82);


let rssiSignalIndex = 0;
const beaconId = guid();

let sendDummyData = function () {
    for (let id in listenerToRssiMap) {
        let data = getBeaconSignalFromListener(id);
        console.log(data);
        let req = request.post({
            url: "http://127.0.0.1:8080/beacon/data",
            method: 'POST',
            json: data
        }, (err, response, body) => {
            if (err) {
                console.log(err);
            }
        });
    }
}



setInterval(sendDummyData, 800);


function getBeaconSignalFromListener(listenerId) {
    rssiSignalIndex = (rssiSignalIndex + 1) % rssiSignals.length;
    return {
        listenerId: listenerId,
        beacon: {
            id: beaconId,
            txPower: txPower(),
            // samples: [{rssi: rssi(listenerId), timestamp: Date.now() + Math.random() * 4000},
            //         {rssi: rssi(listenerId), timestamp: Date.now() + Math.random() * 4000},
            //         {rssi: rssi(listenerId), timestamp: Date.now() + Math.random() * 4000},
            //         {rssi: rssi(listenerId), timestamp: Date.now() + Math.random() * 4000},
            //         {rssi: rssi(listenerId), timestamp: Date.now() + Math.random() * 4000}]
            samples: [{rssi: rssiSignals[rssiSignalIndex], timestamp: Date.now() + Math.random() * 4000},
                    {rssi: rssiSignals[(rssiSignalIndex * 2) % rssiSignals.length], timestamp: Date.now() + Math.random() * 4000},
                    {rssi: rssiSignals[~~(rssiSignalIndex / 2) % rssiSignals.length], timestamp: Date.now() + Math.random() * 4000},
                    {rssi: rssiSignals[Math.floor(Math.sqrt(rssiSignalIndex))], timestamp: Date.now() + Math.random() * 4000}]
        }
    };
}

function txPower() {
    return -12;
}

function rssi(listenerId) {
    return listenerToRssiMap[listenerId];
}

let listenerToRssiMap = {
    "Beacon_Bakery": -64,
    "Beacon_Alcohol": -68,
    "Beacon_Babyfood": -65,
    "Beacon_Tech": 85
};