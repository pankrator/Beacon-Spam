let MapRenderer = require("./maprenderer");
let Utils = require("./utils");

function main() {
    let mapPromise = Utils.loadJSON("data/map.json", "GET", "");
    let canvas = document.getElementById("map-canvas");
    let context = canvas.getContext("2d");
    let renderer = new MapRenderer(context);
    mapPromise.done(mapData => {
        console.log("aaaa");
        renderer.renderMap(mapData);
        console.log(mapData);
    });
};
main();