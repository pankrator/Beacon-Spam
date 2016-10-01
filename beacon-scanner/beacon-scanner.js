'use strict';

const fs = require('fs');

const noble = require('noble');
const jsonfile = require('jsonfile');

const FILENAME = './data2.json';

noble.on('discover', peripheral => {
  let id = peripheral.id;
  let name = peripheral.advertisement && peripheral.advertisement.localName;

  if (typeof name !== 'undefined' && name.startsWith('Kontakt')) {
    let rssi = peripheral.rssi;
    let txPower = peripheral.advertisement.txPowerLevel;
    let distance = calculateDistance(rssi, txPower);

    let beaconData = JSON.stringify({
      name,
      rssi,
      distance,
      date: Date.now()
    }, null, '\t');

    fs.appendFile(FILENAME, `${beaconData},\n`);

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

function calculateDistance(rssi, txPower) {
  if (rssi === 0) {
    return false;
  }

  let ratio = rssi / txPower;

  if (ratio < 1) {
    return Math.pow(ratio, 10);
  } else {
    let distance = (0.89976)*Math.pow(ratio,7.7095) + 0.111;
    return distance / 1000000;
  }
}

function calculateDistance2(rssi, txPower) {
  let distance = Math.pow(10, (txPower - rssi) / 20);
  return distance / 1000;
}
