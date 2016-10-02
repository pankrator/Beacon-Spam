"use strict";
const Utils = require("./utils");

function MapRenderer(context) {
    this._context = context;
    this._map = null;
    this._beaconAnimationProgress = 0;
    this._beaconAnimationDuration = 2000;
};

MapRenderer.prototype.initForMap = function (mapData) {
    this._map = mapData;
    const canvas = this._context.canvas;
    this._context.scale(canvas.width / this._map.roomDimensions.width, canvas.height / this._map.roomDimensions.height);

    for (let place of this._map.places) {
        place.color = Utils.randomColor();
    }
};

MapRenderer.prototype._renderMap = function () {
    const canvas = this._context.canvas;
    this._context.clearRect(0, 0, this._map.roomDimensions.width, this._map.roomDimensions.height);
    this._context.strokeStyle = "black";

    for (const place of this._map.places) {
        this._context.fillStyle = place.color;
        for (const rect of place.rects) {
            this._context.fillRect(rect.x, rect.y, rect.width, rect.height);
        }
        const minX = Utils.MathHelpers.min(place.rects.map(rect => rect.x));
        const minY = Utils.MathHelpers.min(place.rects.map(rect => rect.y));
        const area = Utils.MathHelpers.sum(place.rects.map(rect => rect.width * rect.height));
        // area squared is two much, so empirically take 1.9
        const relativeArea = Math.pow(area, 1.9) / (this._map.roomDimensions.width * this._map.roomDimensions.height);
        this._context.fillStyle = "black";
        this._context.font = ~~relativeArea + "px Calibri";
        this._context.fillText(place.name, minX, minY);
    }
};

MapRenderer.prototype._renderListeners = function (trackers) {
    for (const listenerId in this._map.listeners) {
        const listener = this._map.listeners[listenerId];
        // Draw the listener as a circle
        this._context.beginPath();
        // Draw the listener as a circle whose radius is small percentage of the room's dimensions
        const roomBiggerDimension = Math.max(this._map.roomDimensions.width, this._map.roomDimensions.height);;
        const listenerSmallRadius = 0.02 * roomBiggerDimension;
        this._context.arc(listener.location.x, listener.location.y, listenerSmallRadius, 0, 2 * Math.PI);
        this._context.closePath();
        this._context.fillStyle = "#AAA";
        this._context.fill();
        // Draw the listener's range
        this._context.beginPath();
        this._context.arc(listener.location.x, listener.location.y, listener.range * this._beaconAnimationProgress, 0, 2 * Math.PI);
        this._context.closePath();

        // Is the listener currently visited?
        const allowedDelay = 6000;
        const isVisited = trackers.some(t => {
            const lastSample = t.samples[t.samples.length - 1];
            if (lastSample && lastSample.listenerId === listenerId) {
                console.log(Date.now() - lastSample.timestamp);
            }
            return lastSample && lastSample.listenerId === listenerId && (Date.now() - lastSample.timestamp) <= allowedDelay;
        });

        this._context.save();
            this._context.strokeStyle = isVisited ? "crimson" : "black";
            this._context.lineWidth = 4;
            this._context.globalAlpha = 0.5;
            this._context.stroke();
            this._context.fillStyle = isVisited ? "rgb(196, 64, 64)" : "#AAA";
            this._context.globalAlpha = 0.3;
            this._context.fill();
        this._context.restore();
    }
};

MapRenderer.prototype._renderTrackers = function (trackers) {
    for (const tracker of trackers) {
        if (tracker.samples.length === 0) {
            continue;
        }
        this._context.beginPath();
        const positionForSample = sample => this._map.listeners[sample.listenerId].location;
        this._context.moveTo(positionForSample(tracker.samples[0]).x,
                             positionForSample(tracker.samples[0]).y);
        for (const position of tracker.samples.map(positionForSample)) {
            this._context.lineTo(position.x, position.y);
        }
        this._context.strokeStyle = tracker.color;
        this._context.stroke();
    }
};

MapRenderer.prototype.renderFrame = function (trackers, dt) {
    this._beaconAnimationProgress += dt / this._beaconAnimationDuration;
    if (this._beaconAnimationProgress >= 1) {
        this._beaconAnimationProgress = 0;
    }
    this._renderMap();
    this._renderListeners(trackers);
    // this._renderTrackers(trackers);
};

module.exports = MapRenderer;
