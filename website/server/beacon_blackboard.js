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
     *  listenerId,
     *  beaconId,
     *  timestamp
     * }
     */
    calculatedData: [],

    /**
     * Keeps track of which data is already sent to which client
     */
    alreadySent: {},

    addRaw: function (data) {
        module.exports.rawData.push(data);
    },
    add: function (data) {
        module.exports.calculatedData.push(data);
    }
};