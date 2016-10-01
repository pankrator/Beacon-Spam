"use strict";
const MathHelpers = require("./utils").MathHelpers;
const Vector = require("./vector");

function Charter(context) {
    this._context = context;
    this._currentChart = null;
    Chart.defaults.global.responsive = true;
    Chart.defaults.global.scaleBeginAtZero = false;
    Chart.defaults.global.barBeginAtOrigin = false;
};

Charter.prototype.initForMap = function (mapData) {
    this._map = mapData;
};

// Distance from point p to the line segment defined by v and w
// Taken from http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, segment) {
    let v = segment.v;
    let w = segment.w;
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
}

function distanceToRect(point, rect) {
    const lineSegments = [
        { v: new Vector(rect.x, rect.y), w: new Vector(rect.x + rect.width, rect.y) },
        { v: new Vector(rect.x, rect.y), w: new Vector(rect.x, rect.y + rect.height) },
        { v: new Vector(rect.x + rect.width, rect.y + rect.height), w: new Vector(rect.x + rect.width, rect.y) },
        { v: new Vector(rect.x + rect.width, rect.y + rect.height), w: new Vector(rect.x, rect.y + rect.height) },
    ];
    return MathHelpers.min(lineSegments.map(distToSegmentSquared.bind(undefined, point)));
};

function distanceToPlace(point, place) {
    return MathHelpers.min(place.rects.map(distanceToRect.bind(undefined, point)));
};

/// Draws a histogram of the first placeCount places
Charter.prototype.chartMostVisited = function (trackers, timestampFrom, timestampTo) {
    // Get the closest place to each sample of each tracker.
    const findClosestPlace = point => MathHelpers.argmin(this._map.places, distanceToPlace.bind(undefined, point));
    const currentTime = Date.now();
    const filterOldSamples = sample => timestampFrom <= sample.timestamp && sample.timestamp <= timestampTo;
    const placesPerTracker = trackers.map(tracker => tracker.samples.filter(filterOldSamples).map(findClosestPlace));
     // Flatten the array of arrays
    const placesPerSample = [].concat.apply([], placesPerTracker);
    const placesHistogram = this._map.places.reduce((currentHistogram, place) => {
        currentHistogram.push(MathHelpers.count(placesPerSample, place));
        return currentHistogram;
    }, []);
    const data = {
        labels: this._map.places.map(place => place.name),
        datasets: [{
            label: "Most visited places",
            data: placesHistogram
        }]
    };
    const options = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    };
    this._currentChart = new Chart(this._context, {
        type: "bar",
        data: data,
        options:  options
    });
};

function createZeroedArrayOfSize(size) {
    return Array.apply(null, Array(size)).map(Number.prototype.valueOf,0);
}

/// Draws a histogram of the first placeCount places
Charter.prototype.chartPlaceLoadOverTime = function (trackers, place, timestampFrom, timestampTo, timespanToSplitOver) {
    // Get the closest place to each sample of each tracker.
    const findClosestPlace = point => MathHelpers.argmin(this._map.places, distanceToPlace.bind(undefined, point));
    const currentTime = Date.now();
    const filterOldSamples = sample => timestampFrom <= sample.timestamp && sample.timestamp <= timestampTo;
    const filterDistantSamples = sample => place === findClosestPlace(sample);
    const samplesPerTracker = trackers.map(tracker => tracker.samples.filter(filterOldSamples).filter(filterDistantSamples));
     // Flatten the array of arrays
    let currentPlaceSamples = [].concat.apply([], samplesPerTracker);
    // Split the samples into buckets, each bucket covering a certain time period
    currentPlaceSamples.sort((s1, s2) => s1.timestamp < s2.timestamp);
    const bucketCount = (timestampTo - timestampFrom) / timespanToSplitOver;
    let samplesPerBucket = createZeroedArrayOfSize(bucketCount);
    currentPlaceSamples.reduce((buckets, sample) => {
        const bucketIndexForSample = Math.floor((sample.timestamp - timestampFrom) / timespanToSplitOver);
        buckets[bucketIndexForSample]++;
        return buckets;
    }, samplesPerBucket);
    const data = {
        labels: samplesPerBucket.map((_, index) => new Date(timestampFrom + index * timespanToSplitOver).toLocaleTimeString()),
        datasets: [{
            label: `Number of people at ${place.name}`,
            data: samplesPerBucket
        }]
    };
    const options = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    };
    this._currentChart = new Chart(this._context, {
        type: "line",
        data: data,
        options:  options
    });
};

module.exports = Charter;
