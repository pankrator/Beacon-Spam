'use strict';

const request = require('request');
const noble = require('noble');
const jsonfile = require('jsonfile');

const url = 'http://127.0.0.1:8080';
const BATCH_SIZE = 10;

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
    let json = JSON.stringify(beacon);
    console.log(json);

    request.post({
      url,
      json
    }, (err, httpResponse, body) => {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
}