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
}

function App() {
    this._mapPromise = Utils.loadJSON("data/map.json", "GET", "");
    this._statistician = new SampleStatistician();
    this._viewmodel = new Viewmodel(this.onScreenChanged.bind(this), this._statistician);
    this._animationFrameId = null;
};

App.prototype.onScreenChanged = function (screenIndex) {
    console.log(this);
    if (this._animationFrameId) {
        cancelAnimationFrame(this._animationFrameId);
        this._animationFrameId = null;
    }

    if (screenIndex === Screens.Home) {
        let canvas = document.getElementById("pulsing-circles");
        let context = canvas.getContext("2d");
        let renderer = new MapRenderer(context);
        let previousTimestamp = 0;

        let randomCircles = [];
        // for (let i = 0; i < 10; i++) {
        //     randomCircles.push({
        //         x: Math.floor(Math.random() * 200) + 40,
        //         y: Math.floor(Math.random() * 200) + 40,
        //         radius: 4,
        //         pulseRange: 30
        //     });
        // }
        randomCircles.push({
            x: 20,
            y: 120,
            radius: 1,
            pulseRange: 15
        });

        const renderFrame = timestamp => {
            const dt = timestamp - previousTimestamp;
            previousTimestamp = timestamp;

            // renderer.renderFrame(this._statistician.getTrackers(), dt);

            renderer._clearCanvas(canvas.width, canvas.height);
            renderer._updateBeaconAnimationProgress(dt);
            randomCircles.forEach(function(circle) {
                renderer.renderPulseCircle(circle.x, circle.y,
                                           circle.radius, circle.pulseRange,
                                           "yellow", "#AAA");
            });
            
            this._animationFrameId = requestAnimationFrame(renderFrame);
        };
        renderFrame(0);
    } else if (screenIndex === Screens.Tracking) {
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
        this._viewmodel.charter = charter;
        this._mapPromise.done(mapData => {
            charter.initForMap(mapData);
            const listeners = Object.keys(mapData.listeners);
            this._viewmodel.charterSettings.listeners(listeners);
            setInterval(() =>
                tracker.addSample(listeners[~~(Math.random() * listeners.length)]),
                100);

     setTimeout(() => {
     }, 2000);
        });
    }
};

Q.longStackSupport = true;
App.prototype.main = function main() {
    ko.applyBindings(this._viewmodel);
    setInterval(this._statistician.updateTrackers.bind(this._statistician), 100);
};
let app = new App();
app.main();
