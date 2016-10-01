"use strict";

module.exports = {
    /**
     * {
     *  listernerId: ...,
     *  id: ....,
     *  name: ...,
     *  txPower: ....,
     *  samples: [{rssi: ...., timestamp: .....}, ....],
     *  distanceToListener: ...
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

    addRaw: function (data) {
        module.exports.rawData.push(data);
    }
};