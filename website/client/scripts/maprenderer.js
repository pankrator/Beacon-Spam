function MapRenderer(context) {
    this._context = context;
};

let randomColor = function () {
    return '#'+Math.floor(Math.random()*16777215).toString(16);
};

const MathHelpers = {
    min: (array) => array.reduce((previous, element) => Math.min(previous, element), array[0]),
    max: (array) => array.reduce((previous, element) => Math.max(previous, element), array[0]),
    sum: (array) => array.reduce((previous, element) => previous + element, 0),
};

MapRenderer.prototype.renderMap = function (map) {
    let canvas = this._context.canvas;
    this._context.clearRect(0, 0, canvas.width, canvas.height);
    this._context.scale(canvas.width / map.roomDimensions.width, canvas.height / map.roomDimensions.height);

    this._context.strokeStyle = "black";

    for (let place of map.places) {
        const color = randomColor();
        this._context.fillStyle = color;
        for (const rect of place.rects) {
            this._context.fillRect(rect.x, rect.y, rect.width, rect.height);
        }
        const minX = MathHelpers.min(place.rects.map((rect) => rect.x));
        const minY = MathHelpers.min(place.rects.map((rect) => rect.y));
        const area = MathHelpers.sum(place.rects.map((rect) => rect.width * rect.height));
        // area squared is two much, so empirically take 1.9
        const relativeArea = Math.pow(area, 1.9) / (map.roomDimensions.width * map.roomDimensions.height);
        this._context.fillStyle = "black";
        this._context.font = ~~relativeArea + "px Calibri";
        this._context.fillText(place.name, minX, minY);
    }
};

module.exports = MapRenderer;
