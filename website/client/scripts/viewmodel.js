"use strict";
function Viewmodel(onScreenChanged, statistician) {
    this._screens = ["home", "tracking", "statistics", "about"];
    this.currentScreen = ko.observable(0);
    this._onScreenChanged = onScreenChanged;
    this.statistician = statistician;
    this.charter = null;
    this.charterSettings = {
        chartTypes: ["Most visited", "Beacon load"],
        selectedChart: ko.observable("Most visited"),
        listeners: ko.observableArray(),
        selectedListener: ko.observable(""),
        dataFrom: ko.observable(0),
        dataTo: ko.observable(0),
        timespanToSplitOver: ko.observable(0)
    }
};

Viewmodel.prototype.loadScreen = function (index) {
    this.currentScreen(index);
    this._onScreenChanged(index);
};

function timespanFromTime(hours, minutes, seconds, milliseconds) {
    minutes += hours * 60;
    seconds += minutes * 60;
    milliseconds += seconds * 1000;
    return milliseconds;
};

Viewmodel.prototype.generateChart = function () {
    const from = this.charterSettings.dataFrom();
    const to = this.charterSettings.dataTo();
    const timespanToSplitOver = this.charterSettings.timespanToSplitOver();
    const listener = this.charterSettings.selectedListener();
    if (this.charterSettings.selectedChart() === "Most visited") {
        this.charter.chartMostVisited(this.statistician.getTrackers(), from, to, timespanToSplitOver);
    }
    else {
         this.charter.chartListenerLoadOverTime(this.statistician.getTrackers(), listener, from, to, timespanToSplitOver);
    }
};

Viewmodel.prototype.generateChartOneHourAgo = function () {
    const now = Date.now();
    this.charterSettings.dataFrom(now - timespanFromTime(1, 0, 0, 0));
    this.charterSettings.dataTo(now);
    // Split over 6 minutes
    this.charterSettings.timespanToSplitOver(timespanFromTime(0, 6, 0, 0));
    this.generateChart();
};

Viewmodel.prototype.generateChartOneDayAgo = function () {
    const now = Date.now();
    this.charterSettings.dataFrom(now - timespanFromTime(24, 0, 0, 0));
    this.charterSettings.dataTo(now);
    // Split over 3 hours
    this.charterSettings.timespanToSplitOver(timespanFromTime(3, 0, 0, 0));
    this.generateChart();
};

module.exports = Viewmodel;
