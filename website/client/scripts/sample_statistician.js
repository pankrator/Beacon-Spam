"use strict";

function SampleStatistician() {
    this._trackers = [];
};

SampleStatistician.prototype.registerTracker = function (tracker) {
    this._trackers.push(tracker);
};

SampleStatistician.prototype.removeTracker = function (tracker) {
    this._trackers.remove(tracker);
};

module.exports = SampleStatistician;
