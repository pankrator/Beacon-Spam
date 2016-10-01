'use strict';

const request = require('request');

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
    return {
        listenerId: listenerId,
        beacon: {
            id: guid(),
            txPower: txPower(),
            samples: [{rssi: rssi(listenerId), timestamp: Date.now() + Math.random() * 4000},
                    {rssi: rssi(listenerId), timestamp: Date.now() + Math.random() * 4000},
                    {rssi: rssi(listenerId), timestamp: Date.now() + Math.random() * 4000},
                    {rssi: rssi(listenerId), timestamp: Date.now() + Math.random() * 4000},
                    {rssi: rssi(listenerId), timestamp: Date.now() + Math.random() * 4000}]
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
    "Beacon_Backery": -64,
    "Beacon_Alchohol": -68,
    "Beacon_Babyfood": -65,
    "Beacon_Tech": 85
};

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