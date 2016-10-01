'use strict';

const createViewModel = require('./main-view-model').createViewModel;

const http = require('http');
const bluetooth = require('nativescript-bluetooth');
const async = require('async');

const BATCH_SIZE = 3;

let url = 'http://10.255.255.16:8080/beacon/data';
let listenerId = 'Beacon_Alcochol';
let txPower = -12;

let beacons = new Map();

function onNavigatingTo(args) {
  let page = args.object;
  
  page.bindingContext = createViewModel(function() {
    url = page.bindingContext.serverUrl;
    txPower = page.bindingContext.txPower;
    listenerId = page.bindingContext.listenerId;

    async.timesSeries(9000, scan, () => {
      console.log('Scanning stopped');
    });
  });
}

function scan(n, callback) {
  bluetooth.hasCoarseLocationPermission().then((granted) => {
      if (granted) {
        console.log('Coarse location granted');

        bluetooth.startScanning({
          serviceUUIDs: [],
          seconds: 1,
          onDiscovered: addSample
        }).then(() => {
          console.log('scanning complete');
          return callback();
        }, (err) => {
          console.log(`Error while scanning: ${err}`);
          return callback(err);
        });
      } else {
        console.log('Coarse location not granted');

        bluetooth.requestCoarseLocationPermission().then(() => {
            console.log('REQUESTING');
        });

        return callback('permission not granted');
      }
    }
  );
}

function addSample(device) {
  console.log("addSample", device)
  let id = device.UUID;
  let beacon = beacons.get(id);

  if (!beacon) {
    let name = device.name;
    if (name === null || typeof name === 'undefined' || !name.startsWith('Kontakt')) {
      return;
    }

    beacon = {
      name,
      txPower: txPower,
      samples: []
    };

    beacons.set(id, beacon);
  }

  let sample = {
    rssi: device.RSSI,
    timestamp: Date.now()
  };

  beacon.samples.push(sample);

  if (beacon.samples.length >= BATCH_SIZE) {
    beacon.id = id;
    sendSamples(beacon).then((data) => {
      beacons.set(id, undefined);
    }).catch(err => {
      console.log(err);
    });
  }
}

function sendSamples(beacon) {
  return new Promise((resolve, reject) => {
    let json = JSON.stringify({
      listenerId: listenerId,
      beacon
    });
    console.log(json);

    http.request({
      url,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      content: json
    }).then(resolve, reject);
  });
}

exports.onNavigatingTo = onNavigatingTo;