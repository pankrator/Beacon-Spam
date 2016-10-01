"use strict";

const Charter = require("./charter");
const MapRenderer = require("./maprenderer");
const SampleStatistician = require("./sample_statistician");
const Utils = require("./utils");

function main() {
    let mapPromise = Utils.loadJSON("data/map.json", "GET", "");
    let canvas = document.getElementById("map-canvas");
    let context = canvas.getContext("2d");
    let renderer = new MapRenderer(context);
    mapPromise.done(mapData => {
        renderer.initForMap(mapData);
        const renderFrame = function () {
            renderer.renderFrame();
            requestAnimationFrame(renderFrame);
        };
        renderFrame();
    });
    let statistician = new SampleStatistician();
    let tracker = statistician.registerTracker();
    renderer.registerTracker(tracker);

    let chartCanvas = document.getElementById("chart-canvas");
    let charter = new Charter(chartCanvas.getContext("2d"));
    mapPromise.done(mapData => {
        charter.initForMap(mapData);
        setInterval(() =>
            tracker.addSample(Math.random() * mapData.roomDimensions.width,
                            Math.random() * mapData.roomDimensions.height),
            100);
    });
    // Wait for the tracker to put gather some data
    setTimeout(() =>
        charter.chartMostVisited(statistician.getTrackers(), "Most visited places"), 2000);
};
main();
