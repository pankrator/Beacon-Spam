'use strict';

module.exports = function(measurements) {
    measurements = filterOutliers(measurements);

    let sum = measurements.reduce((a, b) => a + calculateDistance(b.rssi, b.txPower), 0);
    let average = sum / measurements.length;

    return average;
};

function filterOutliers(measurements) {
    measurements.sort((m1, m2) => m1.rssi - m2.rssi);
    measurements.pop();
    measurements.shift();

    return measurements;
}

function calculateDistance(rssi, txPower) {
  if (rssi === 0) {
    return false;
  }

  let factor;
  if (rssi < -90) {
      factor = 3;
  } else if (rssi < -80) {
      factor = 2.5;
  } else if (rssi < -75) {
      factor = 2;
  } else {
      factor = 0.89976;
  }


  let ratio = rssi / txPower;

  if (ratio < 1) {
    return Math.pow(ratio, 10);
  } else {
    let distance = factor * Math.pow(ratio, 7.7095) + 0.111;
    return distance / 1000000;
  }
}
