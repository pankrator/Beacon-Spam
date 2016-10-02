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
    this._productsPromise = Utils.loadJSON("/products", "GET", "");
    this._statistician = new SampleStatistician(this);
    this._viewmodel = new Viewmodel(this.onScreenChanged.bind(this), this.onUserPathReceived.bind(this), this._statistician);
    this._userTracker = this._statistician.registerTracker();
    this._animationFrameId = null;
};

App.prototype.onUserPathReceived = function (path) {
    this._userTracker.samples = path.map((listener, index) => {
        return {
            listenerId: `Listener_${listener}`,
            timestamp: Date.now() + timespanFromTime(0, 0, 0, index * 2000)
        };
    });
    this._userTracker.color = "crimson";
    alert("Follow the crimson path to your destination!");
}

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
        randomCircles.push({
            x: 20,
            y: 120,
            radius: 1,
            pulseRange: 15
        });

        const renderFrame = timestamp => {
            const dt = timestamp - previousTimestamp;
            previousTimestamp = timestamp;

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
        // Resize the canvas to the size of its container
        const containerStyle = window.getComputedStyle(canvas.parentElement);
        canvas.width = parseFloat(containerStyle.width) * 0.9;
        canvas.height = parseFloat(containerStyle.height) * 0.9;
        let context = canvas.getContext("2d");
        let renderer = new MapRenderer(context);

        this._productsPromise.done(productData => {
            this._viewmodel.productSettings.productList(productData);
            this._viewmodel.renderer = renderer;
        });
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
