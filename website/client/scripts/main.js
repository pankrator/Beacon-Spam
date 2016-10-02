"use strict";

const Charter = require("./charter");
const MapRenderer = require("./maprenderer");
const SampleStatistician = require("./sample_statistician");
const Utils = require("./utils");
const Viewmodel = require("./viewmodel");

function timespanFromTime(hours, minutes, seconds, milliseconds) {
    minutes += hours * 60;
    seconds += minutes * 60;
    milliseconds += seconds * 1000;
    return milliseconds;
};

let Screens = {
    Home: 0,
    Tracking: 1,
    Statistics: 2,
    About: 3
}

function App() {
    this._mapPromise = Utils.loadJSON("data/map.json", "GET", "");
    this._viewmodel = new Viewmodel(this.onScreenChanged.bind(this));
    this._statistician = new SampleStatistician();
    this._animationFrameId = null;
};

App.prototype.onScreenChanged = function (screenIndex) {
    console.log(this);
    if (this._animationFrameId) {
        cancelAnimationFrame(this._animationFrameId);
        this._animationFrameId = null;
    }

    if (screenIndex === Screens.Tracking) {
        let canvas = document.getElementById("map-canvas");
        let context = canvas.getContext("2d");
        let renderer = new MapRenderer(context);

        this._mapPromise.done(mapData => {
            renderer.initForMap(mapData);
            let previousTimestamp = 0;
            const renderFrame = timestamp => {
                const dt = timestamp - previousTimestamp;
                previousTimestamp = timestamp;

                renderer.renderFrame(this._statistician.getTrackers(), dt);
                this._animationFrameId = requestAnimationFrame(renderFrame);
            };
            renderFrame(0);
        });
    }
    else if (screenIndex === Screens.Statistics) {
        let tracker = this._statistician.registerTracker();

        let chartCanvas = document.getElementById("chart-canvas");
        let charter = new Charter(chartCanvas.getContext("2d"));
        this._mapPromise.done(mapData => {
            charter.initForMap(mapData);
            const listeners = Object.keys(mapData.listeners);
            setInterval(() =>
                tracker.addSample(listeners[~~(Math.random() * listeners.length)]),
                100);

     setTimeout(() => {
         const from = Date.now() - timespanFromTime(0, 0, 0, 500);
         const to = Date.now();
         const timespanToSplitOver = timespanFromTime(0, 0, 0, 100);
         charter.chartMostVisited(this._statistician.getTrackers(), from, to, timespanToSplitOver);
     }, 2000);
        });
    }
};

Q.longStackSupport = true;
App.prototype.main = function main() {
    ko.applyBindings(this._viewmodel);
    setInterval(this._statistician.updateTrackers.bind(this._statistician), 100);
    return;

     setTimeout(() => {
         const from = Date.now() - timespanFromTime(0, 0, 0, 1000);
         const to = Date.now();
         const timespanToSplitOver = timespanFromTime(0, 0, 0, 200);
         charter.chartListenerLoadOverTime(statistician.getTrackers(), "Listener_Alcohol", from, to, timespanToSplitOver);
     }, 2000);
};
let app = new App();
app.main();
