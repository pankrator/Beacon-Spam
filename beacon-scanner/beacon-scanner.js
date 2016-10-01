const fs = require('fs');

const noble = require('noble');
const jsonfile = require('jsonfile');

const RSSI_THRESHOLD = -90;
const EXIT_GRACE_PERIOD = 200; // milliseconds
const FILENAME = './data2.json';

let inRange = [];

noble.on('discover', peripheral => {
  if (peripheral.rssi < RSSI_THRESHOLD) {
    return;
  }

  let id = peripheral.id;
  let name = peripheral.advertisement && peripheral.advertisement.localName;
  let entered = !inRange[id];

  if (typeof name !== 'undefined' && name.startsWith('Kontakt')) {
    let rssi = peripheral.rssi;
    let txPower = peripheral.advertisement.txPowerLevel;
    let distance = calculateDistance(rssi, txPower);
    console.log(distance);

    inRange[id] = {
      peripheral: peripheral
    };

    let beaconData = JSON.stringify({
      name,
      rssi,
      distance,
      date: new Date()
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
  console.log(ratio);

  if (ratio < 1) {
    return Math.pow(ratio, 10);
  } else {
    let distance = (0.89976)*Math.pow(ratio,7.7095) + 0.111;
    fs.appendFile('./distance.txt', `${rssi}\n`);
    fs.appendFile('./time.txt', Date.now());
    console.log(rssi);
    console.log(Date.now());
    return distance / 1000000;
  }
}

