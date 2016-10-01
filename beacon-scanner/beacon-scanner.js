'use strict';

const fs = require('fs');

const noble = require('noble');
const jsonfile = require('jsonfile');

const calculateDistance = require('./distance');

const FILENAME = './data2.json';

let beacons = new Map();

noble.on('discover', peripheral => {
  let id = peripheral.id;
  let name = peripheral.advertisement && peripheral.advertisement.localName;
  
  let measurements = [];
  if (beacons.get(name)) {
    measurements = beacons.get(name);
  } else {
    beacons.set(name, []);
  }

  if (typeof name !== 'undefined' && name.startsWith('Kontakt')) {
    let rssi = peripheral.rssi;
    let txPower = peripheral.advertisement.txPowerLevel;
    let bluetoothData = {
      rssi,
      txPower,
      date: Date.now() 
    };
    
    measurements.push(bluetoothData);
    if (measurements.length >= 10) {
      console.log(calculateDistance(measurements));
      beacons.set(name, []);
    }

    console.log('"' + name + '" entered (RSSI ' + rssi + ') ' + new Date());
  }
});

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    noble.startScanning([], true);
  } else {
    noble.stopScanning();
  }
});
