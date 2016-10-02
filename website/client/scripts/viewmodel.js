"use strict";
function Viewmodel(onScreenChanged) {
    this._screens = ["home", "tracking", "statistics", "about"];
    this.currentScreen = ko.observable(0);
    this._onScreenChanged = onScreenChanged;
    this.charterSettings = {
        chartTypes: ["Most visited", "Beacon load"],
        selectedChart: ko.observable("Most visited"),
        dataFrom: ko.observable(0),
        dataTo: ko.observable(0),
    }
};

Viewmodel.prototype.loadScreen = function (index) {
    this.currentScreen(index);
    this._onScreenChanged(index);
}

module.exports = Viewmodel;
