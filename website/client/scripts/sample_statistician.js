"use strict";
const Utils = require("./utils");

function SampleStatistician() {
    this._trackers = [];
};

SampleStatistician.prototype.registerTracker = function (tracker) {
    this._trackers.push(new Tracker(10));
    return this._trackers[this._trackers.length - 1];
};

SampleStatistician.prototype.removeTracker = function (tracker) {
    this._trackers.remove(tracker);
};

SampleStatistician.prototype.updateTrackers = function () {
    return Utils.loadJSON("/beacon", "GET").done((data) => {
        // this._trackers.sort((a, b) => { return a.id.localeCompare(b.id)});
        data.forEach(function(beacon) {
            var el = _.find(this._trackers, { id: beacon.id});
            if (el) {
                el.samples = el.samples.concat(beacon.samples);
            } else {
                this._trackers.push(new Tracker(Infinity, beacon.id, beacon.samples));
            }
        });
    });
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

Tracker.prototype.addSample = function (sampleX, sampleY) {
    this.samples.push({ x: sampleX, y: sampleY});
    if (this.samples.length >= this._maxSampleCount) {
        this.samples.shift();
    }
};

module.exports = SampleStatistician;
