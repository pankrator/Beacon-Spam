const noble = require('noble');

const RSSI_THRESHOLD = -90;
const EXIT_GRACE_PERIOD = 200; // milliseconds

var inRange = [];

noble.on('discover', function(peripheral) {
    if (peripheral.rssi < RSSI_THRESHOLD) {
        return;
    }

    var id = peripheral.id;
    var entered = !inRange[id];

    if (entered) {
        inRange[id] = {
            peripheral: peripheral
        };

        console.log('"' + peripheral.advertisement.localName + '" entered (RSSI ' + peripheral.rssi + ') ' + new Date());
    }

    inRange[id].lastSeen = Date.now();
});

setInterval(function() {
    for (var id in inRange) {
        if (inRange[id].lastSeen < (Date.now() - EXIT_GRACE_PERIOD)) {
            var peripheral = inRange[id].peripheral;

            console.log('"' + peripheral.advertisement.localName + '" exited (RSSI ' + peripheral.rssi + ') ' + new Date());

            delete inRange[id];
        }
    }
}, EXIT_GRACE_PERIOD / 2);

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning([], true);
    } else {
        noble.stopScanning();
    }
});
