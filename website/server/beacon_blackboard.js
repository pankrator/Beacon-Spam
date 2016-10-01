"use strict";

module.exports = {
    /**
     * {
     *  listernerId: ...,
     *  id: ....,
     *  txPower: ...,
     *  samples: [{rssi: ..., timestamp: ...}, ...]
     *  
     * }
     */
    rawData: [],

    /**
     * {
     *  timestamp: ...,
     *  beaconPositions: {
     *      "beaconId": {x: Number, y: Number }
     *      "beaconId2": {x: Number, y: Number }
     *  }
     */
    calculatedData: [],

    /**
     * Keeps track of which data is already sent to which client
     */
    alreadySent: {},

    addRaw: function (data) {
        module.exports.rawData.push(data);
    }
};