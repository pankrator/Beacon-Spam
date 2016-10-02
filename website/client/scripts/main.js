"use strict";

const Charter = require("./charter");
const MapRenderer = require("./maprenderer");
const SampleStatistician = require("./sample_statistician");
const Utils = require("./utils");

function timespanFromTime(hours, minutes, seconds, milliseconds) {
    minutes += hours * 60;
    seconds += minutes * 60;
    milliseconds += seconds * 1000;
    return milliseconds;
};

Q.longStackSupport = true;
function main() {
    let mapPromise = Utils.loadJSON("data/map.json", "GET", "");
    let canvas = document.getElementById("map-canvas");
    let context = canvas.getContext("2d");
    let renderer = new MapRenderer(context);
    
    let statistician = new SampleStatistician();
    mapPromise.done(mapData => {
        renderer.initForMap(mapData);
        const renderFrame = function () {
            renderer.renderFrame(statistician.getTrackers());
            requestAnimationFrame(renderFrame);
        };
        renderFrame();
    });
    //let tracker = statistician.registerTracker();
    setInterval(statistician.updateTrackers.bind(statistician), 100);
    //renderer.registerTracker(tracker);

    let chartCanvas = document.getElementById("chart-canvas");
    let charter = new Charter(chartCanvas.getContext("2d"));
    mapPromise.done(mapData => {
        charter.initForMap(mapData);
        // setInterval(() =>
        //     tracker.addSample(Math.random() * mapData.roomDimensions.width,
        //                     Math.random() * mapData.roomDimensions.height),
        //     10);
    });
    // Wait for the tracker to put gather some data

    // setTimeout(() => {
    //     const from = Date.now() - timespanFromTime(0, 0, 0, 500);
    //     const to = Date.now();
    //     const timespanToSplitOver = timespanFromTime(0, 0, 0, 100);
    //    // charter.chartMostVisited(statistician.getTrackers(), from, to, timespanToSplitOver);
    // }, 2000);

    // setTimeout(() => {
    //     const from = Date.now() - timespanFromTime(0, 0, 0, 1000);
    //     const to = Date.now();
    //     const timespanToSplitOver = timespanFromTime(0, 0, 0, 200);
    //     charter.chartPlaceLoadOverTime(statistician.getTrackers(), charter._map.places[0], from, to, timespanToSplitOver);
    // }, 2000);
};
main();
