"use strict";

function sendData(path, verb, body) {
    let xhr = new XMLHttpRequest();
    let deferred = Q.defer();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE ) {
            if (xhr.status === 200) {
                deferred.resolve(xhr);
            } else {
                let error = `Could not open ${path}. ` +
                            `Status code: ${xhr.status}`;
                console.error(error);
                deferred.reject(xhr);
            }
        }
    };
    xhr.open(verb, path, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(body));

    return deferred.promise;
};

function loadJSON(path, verb, body) {
    let deferred = Q.defer();
    let onfulfill = (xhr) => {
        try {
            let obj = eval("new Object(" + xhr.responseText + ");");
            deferred.resolve(obj);
        } catch (error) {
            console.error(error);
            deferred.reject(xhr);
        }
        return deferred.promise;
    };
    let onerror = (xhr) => {
        deferred.reject(xhr);
        return deferred.promise;
    };
    return sendData(path, verb, body).then(onfulfill, onerror);
};

module.exports = {
    sendData: sendData,
    loadJSON: loadJSON
};
