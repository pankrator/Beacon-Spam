"use strict";
const Utils = require("./utils");

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

function Tracker(sampleCount) {
    this._maxSampleCount = sampleCount;
    this.id = guid();
    this.samples = [];
    this.color = Utils.randomColor();
};

Tracker.prototype.addSample = function (sampleX, sampleY) {
    this.samples.push({ x: sampleX, y: sampleY});
    if (this.samples.length >= this._maxSampleCount) {
        this.samples.shift();
    }
};

module.exports = Tracker;
