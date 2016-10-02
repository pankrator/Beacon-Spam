"use strict";
const Utils = require("./utils");
const _ = require("lodash");

function SampleStatistician(app) {
    this._trackers = [];
    this._app = app;
};

SampleStatistician.prototype.registerTracker = function (tracker) {
    this._trackers.push(new Tracker(1e4));
    return this._trackers[this._trackers.length - 1];
};

SampleStatistician.prototype.removeTracker = function (tracker) {
    this._trackers.remove(tracker);
};

SampleStatistician.prototype.updateTrackers = function () {
    window.s = this;
    return Utils.loadJSON("/beacon", "GET").done((beaconsToListeners) => {
        if (beaconsToListeners.length === 0) return;
        // console.log('data has come!', beaconsToListeners.length);

        this._trackers.forEach(tracker => {
            if (tracker == this._app._userTracker){
                return;
            }
            tracker.samples = [];
        });

        beaconsToListeners.forEach(beacon => {
            let locationSample = {
                listenerId: beacon.listenerId,
                timestamp: beacon.timestamp
            };
            let el = _.find(this._trackers, { id: beacon.beaconId });
            if (el) {
                el.samples.push(locationSample);
            } else {
                this._trackers.push(new Tracker(Infinity, beacon.beaconId, [locationSample]));
            }
        });
    });
};

SampleStatistician.prototype.getTrackers = function () {
    return this._trackers;
};

// Taken from stackoverflow; not actual guid http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};

function Tracker(sampleCount, id, samples) {
    this._maxSampleCount = sampleCount;
    this.id = id || guid();
    this.samples = samples || [];
    this.color = Utils.randomColor();
};

Tracker.prototype.addSample = function (listenerId) {
    this.samples.push({ listenerId: listenerId, timestamp: Date.now()});
    if (this.samples.length >= this._maxSampleCount) {
        this.samples.shift();
    }
};

module.exports = SampleStatistician;
