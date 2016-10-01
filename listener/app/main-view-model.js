var Observable = require("data/observable").Observable;

function getMessage(counter) {
    if (counter <= 0) {
        return "Hoorraaay! You unlocked the NativeScript clicker achievement!";
    } else {
        return counter + " taps left";
    }
}

function createViewModel(onSubmitCallback) {
    var viewModel = new Observable();
    viewModel.counter = 42;
    viewModel.message = getMessage(viewModel.counter);
    viewModel.listenerId = "Beacon_Alchohol"
    viewModel.serverUrl = "http://10.255.255.16:8080/beacon/data"
    viewModel.txPower = -12;

    viewModel.onSubmit = onSubmitCallback

    return viewModel;
}

exports.createViewModel = createViewModel;
