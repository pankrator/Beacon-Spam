'use strict';

module.exports = function calculateAverageDistance(measurements) {
    console.log(measurements);
    measurements = filterOutliers(measurements);
    console.log(measurements);
    console.log(measurements.length);
    
    measurements.forEach(m => console.log(calculateDistance(m.rssi, m.txPower)));
    let sum = measurements.reduce((a, b) => a + calculateDistance(b.rssi, b.txPower), 0);    
    let average = sum / measurements.length;
    
    return average;
};

function calculateAverageDelay(timestamps) {
    let deltas = timestamps.map((value, index, arr) => arr[index + 1] - arr[index]);
    deltas.pop();
    console.log(deltas);

    let sum = deltas.reduce((a, b) => a + b);
    let average = sum / deltas.length;
    
    return average;
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

function calculateDistance2(rssi, txPower) {
  let distance = Math.pow(10, (txPower - rssi) / 20);
  return distance / 1000;
}

function filterOutliers(measurements) {

    // Copy the values, rather than operating on references to existing values
    let values = measurements.map(m => m.rssi);

    // Then sort
    values.sort((a,b) => a - b);
    
    /* Then find a generous IQR. This is generous because if (values.length / 4) 
     * is not an int, then really you should average the two elements on either 
     * side to find q1.
     */     
    let q1 = values[Math.floor((values.length / 4))];
    // Likewise for q3. 
    let q3 = values[Math.ceil((values.length * (3 / 4)))];
    let iqr = q3 - q1;

    // Then find min and max values
    let maxValue = q3 + iqr*1.2;
    let minValue = q1 - iqr*1.2;
    console.log(maxValue);
    console.log(minValue);

    // Then filter anything beyond or beneath these values.
    let filteredValues = measurements.filter(m => (m.rssi < maxValue) && (m.rssi > minValue));

    console.log(filteredValues.length);
    // Then return
    return filteredValues;
}

function filterOutliers(measurements) {
    measurements.sort((m1, m2) => m1.rssi - m2.rssi);
    measurements.pop();
    measurements.shift();
    console.log(measurements);
    
    return measurements;
}