const MapRenderer = require("./maprenderer");
const Tracker = require("./tracker");
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
    let tracker = new Tracker(10);
    renderer.registerTracker(tracker);
    setInterval(() =>
        tracker.addSample(Math.random() * canvas.width,
                          Math.random() * canvas.height),
        100);
};
main();
