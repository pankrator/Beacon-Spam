'use strict';

const noble = require('noble');
const jsonfile = require('jsonfile');
const calculateDistance = require('./distance');

let beacons = new Map();

noble.on('discover', addMeasurement);

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    noble.startScanning([], true);
  } else {
    noble.stopScanning();
  }
});

function addMeasurement(peripheral) {
  let id = peripheral.id;
  let name = peripheral.advertisement && peripheral.advertisement.localName;

  if (typeof name !== 'undefined' && name.startsWith('Kontakt')) {
    let rssi = peripheral.rssi;
    let txPower = peripheral.advertisement.txPowerLevel;
    let bluetoothData = {
      id,
      name,
      rssi,
      txPower,
      timestamp: Date.now() 
    };

    let measurements = [];
    if (beacons.get(name)) {
      measurements = beacons.get(name);
    } else {
      beacons.set(name, []);
    }
    
    measurements.push(bluetoothData);
    if (measurements.length >= 7) {
      console.log(calculateDistance(measurements));
      beacons.set(name, []);
    }

    console.log(`${name} entered (RSSI: ${rssi}), ${new Date()}`);
  }  
}