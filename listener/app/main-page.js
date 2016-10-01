var createViewModel = require("./main-view-model").createViewModel;
var bluetooth = require("nativescript-bluetooth");

function onNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = createViewModel();

    bluetooth.hasCoarseLocationPermission().then(
        function(granted) {
            if (granted) {
                bluetooth.startScanning({
                    serviceUUIDs: [],
                    seconds: 4,
                    onDiscovered: function (peripheral) {
                        console.log("Periperhal found with UUID: " + peripheral.UUID);
                    }
                }).then(function() {
                    console.log("scanning complete");
                }, function (err) {
                    console.log("error while scanning: " + err);
                });
            } else {
                bluetooth.requestCoarseLocationPermission().then(
                    function() {
                        console.log("Location permission requested");
                    }
                );
            }
            // if this is 'false' you probably want to call 'requestCoarseLocationPermission' now
            console.log("Has Location Permission? " + granted);
        }
    );



}



exports.onNavigatingTo = onNavigatingTo;