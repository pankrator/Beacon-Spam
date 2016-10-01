"use strict";
const Utils = require("./utils");

function Tracker(sampleCount) {
    this._maxSampleCount = sampleCount;
    this.samples = [];
    this.tracker = Utils.randomColor();
};

Tracker.prototype.addSample = function (sampleX, sampleY) {
    this.samples.push({ x: sampleX, y: sampleY});
    if (this.samples.length >= this._maxSampleCount) {
        this.samples.shift();
    }
};

module.exports = Tracker;
