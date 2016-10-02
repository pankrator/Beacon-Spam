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

/// Draws a histogram of the first placeCount places
Charter.prototype.chartMostVisited = function (trackers, timestampFrom, timestampTo) {
    const filterOldSamples = sample => timestampFrom <= sample.timestamp && sample.timestamp <= timestampTo;
    const listenersPerTracker = trackers.map(tracker => tracker.samples.filter(filterOldSamples).map(s => s.listenerId));
     // Flatten the array of arrays
    const listenerPerSample = [].concat.apply([], listenersPerTracker);
    const listenerNames = Object.keys(this._map.listeners);
    const placesHistogram = listenerNames.reduce((currentHistogram, listener) => {
        currentHistogram.push(MathHelpers.count(listenerPerSample, listener));
        return currentHistogram;
    }, []);
    const data = {
        labels: listenerNames,
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

/// Draws a line chart displaying how the load of the specified listener changed over time
Charter.prototype.chartListenerLoadOverTime = function (trackers, listenerId, timestampFrom, timestampTo, timespanToSplitOver) {
    const filterOldSamples = sample => timestampFrom <= sample.timestamp && sample.timestamp <= timestampTo;
    const filterOwnSamples = sample => sample.listenerId === listenerId;
    const samplesPerTracker = trackers.map(tracker => tracker.samples.filter(filterOldSamples).filter(filterOwnSamples));
     // Flatten the array of arrays
    let currentListenerSamples = [].concat.apply([], samplesPerTracker);
    // Split the samples into buckets, each bucket covering a certain time period
    currentListenerSamples.sort((s1, s2) => s1.timestamp < s2.timestamp);
    const bucketCount = (timestampTo - timestampFrom) / timespanToSplitOver;
    let samplesPerBucket = createZeroedArrayOfSize(bucketCount);
    currentListenerSamples.reduce((buckets, sample) => {
        const bucketIndexForSample = Math.floor((sample.timestamp - timestampFrom) / timespanToSplitOver);
        buckets[bucketIndexForSample]++;
        return buckets;
    }, samplesPerBucket);
    const data = {
        labels: samplesPerBucket.map((_, index) => new Date(timestampFrom + index * timespanToSplitOver).toLocaleTimeString()),
        datasets: [{
            label: `Number of people at ${listenerId}`,
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
