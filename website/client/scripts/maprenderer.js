"use strict";
const Utils = require("./utils");

function MapRenderer(context) {
    this._context = context;
    this._map = null;
    this._trackers = [];
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
        this._context.arc(listener.location.x, listener.location.y, listener.range, 0, 2 * Math.PI);
        this._context.closePath();
        this._context.strokeStyle = "black";
        this._context.lineWidth = 4;
        this._context.save();
        this._context.globalAlpha = 0.5;
        this._context.stroke();
        this._context.fillStyle = "#AAA";
        this._context.globalAlpha = 0.3;
        this._context.fill();
        this._context.restore();
    }
};

MapRenderer.prototype._renderTrackers = function () {
    for (const tracker of this._trackers) {
        if (tracker.samples.length === 0) {
            continue;
        }
        this._context.beginPath();
        this._context.moveTo(tracker.samples[0].x,
                             tracker.samples[0].y);
        for (const sample of tracker.samples) {
            this._context.lineTo(sample.x, sample.y);
        }
        this._context.strokeStyle = tracker.color;
        this._context.stroke();
    }
};

MapRenderer.prototype.renderFrame = function () {
    this._renderMap();
    this._renderTrackers();
};

MapRenderer.prototype.registerTracker = function (tracker) {
    this._trackers.push(tracker);
};

MapRenderer.prototype.removeTracker = function (tracker) {
    this._trackers.remove(tracker);
};

module.exports = MapRenderer;
