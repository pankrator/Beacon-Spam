"use strict";

module.exports = {
    /**
     * {
     *  id: ....,
     *  name: ...,
     *  txPower: ....,
     *  samples: [{rssi: ...., timestamp: .....}, ....]
     * }
     */
    rawData: [],

    /**
     * {
     *  id: ....,
     *  name: ...,
     *  samples: [{x:..., y:..., timestamp:...}, ....]
     * }
     */
    calculatedData: [],

    /**
     * Keeps track of which data is already sent to clients
     */
    alreadySent: {},

    add: function (data) {
        module.exports.rawData.push(data);
    }
};