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
    data: [],

    add: function (data) {
        module.exports.data.push(data);
    }
};