'use strict';

const request = require('request');
const noble = require('noble');
const jsonfile = require('jsonfile');

const URL = 'http://10.255.255.16:8080/beacon/data';
const BATCH_SIZE = 3;
const LISTENER_ID = 'Beacon_Babyfood';

let beacons = new Map();

noble.on('discover', addSample);

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    noble.startScanning([], true);
  } else {
    noble.stopScanning();
  }
});

function addSample(device) {
  let id = device.id;
  let beacon = beacons.get(id);

  if (!beacon) {
    let name = device.advertisement.localName;
    if (typeof name === 'undefined' || !name.startsWith('Kontakt')) {
      return;
    }

    beacon = {
      name,
      txPower: device.advertisement.txPowerLevel,
      samples: []
    };

    beacons.set(id, beacon);
  }

  let sample = {
    rssi: device.rssi,
    timestamp: Date.now()
  };

  beacon.samples.push(sample);

  if (beacon.samples.length >= BATCH_SIZE) {
    beacon.id = id;
    sendSamples(beacon).then((data) => {
      delete beacon.id;
      beacon.samples = [];
    }).catch(err => {
      console.log(err);
    });
  }
}

function sendSamples(beacon) {
  return new Promise((resolve, reject) => {
<<<<<<< HEAD
    let json = {
      listenerId: LISTENER_ID,
      beacon
    };
=======
    let json = JSON.stringify({listernerId: LISTENER_ID, beacon: beacon});
>>>>>>> Move maths to website. Calculate distance to beacons at server.
    console.log(json);

    request({
      url: URL,
      method: 'POST',
      json
    }, (err, httpResponse, body) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve();
      }
    );
  });
}
