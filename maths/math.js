'use strict';

let vector = require('./vector');

/**
* p1 is the center of one of the spheres in the original coordinate system
* also p1 is the origin of the new coordinate system
* p2, p3 are the centers of the spheres fullfilling the following requirements
* all centers are in the plane z = 0,
* the sphere center, P1, is at the origin, and
* the sphere center, P2, is on the x-axis.
* Formula is taken from https://en.wikipedia.org/wiki/Trilateration
**/
var trilaterateAlgo = function(p1, p2, p3, r1, r2, r3) {
    let x, y;

    // Make the important check for distance between first two spheres!!

    // x = (r1^2 - r2^2 + d^2) / 2*d
    x = ((r1 * r1) - (r2 * r2) + (p2.x * p2.x)) / (2 * p2.x);

    // y = ((r1^2 - r3^2 + i^2 + j^2) / 2*j) - (i/j) * x
    
    y  = (((r1 * r1) - (r3 * r3) + (p3.x * p3.x) + (p3.y * p3.y)) / (2 * p3.y)) - (p3.x/p3.y) * x;

    // z1 = +sqrt(r1*r1 - x*x - y*y);
    // z2 = -sqrt(r1*r1 - x*x - y*y);
    let D = r1*r1 - x*x - y*y;

    x += p1.x;
    y += p1.y;
    // console.log("x=", x, "y=", y, "z=", D);

    return {x: x, y: y};
    // if (D < 0) {
    //     return null;
    // } else if (D == 0) {
    //     return [{x: x, y: y, z: p1.z}];
    // } else if (D > 0) {
    //     let z = Math.sqrt(D);
    //     return [{x: x, y: y, z: z + p1.z},
    //             {x: x, y: y, z: -z + p1.z}];
    // }
}

var pointSubtract = function(p1, p2) {
    return {
        x: p1.x - p2.x,
        y: p1.y - p2.y,
        z: p1.z - p2.z
    }
}

var dist = function(p1, p2) {
    var v = pointSubtract(p1, p2);
    return Math.sqrt(v.x*v.x + v.y*v.y);
}

// two of the centers shuold have the same Y coord
var trilaterate = function (p1, p2, p3, r1, r2, r3) {
    if(p1.y == p2.y) {
        return trilaterateAlgo(p1, pointSubtract(p2, p1), pointSubtract(p3, p1), r1, r2, r3);
    }

    if(p2.y == p3.y) {
        return trilaterateAlgo(p2, pointSubtract(p3, p2), pointSubtract(p1, p2), r2, r3, r1);
    }

    if(p3.y == p1.y) {
        return trilaterateAlgo(p3, pointSubtract(p1, p3), pointSubtract(p2, p3), r3, r1, r2);
    }
}

var getLocation4Listeners = function(data) {
    var bestLocation, bestError = 1e9;

    // w/o point 0
    loc = trilaterate(data[1].p, data[2].p, data[3].p, data[1].r, data[2].r, data[3].r);
    err = Math.abs(dist(loc, data[0].p) - data[0].r);
    console.log("tril by points 0 1 2 ", loc, err)
    if (err < bestError) {
        bestError = err;
        bestLocation = loc;
    }


    // w/o point 1
    loc = trilaterate(data[0].p, data[2].p, data[3].p, data[0].r, data[2].r, data[3].r);
    err = Math.abs(dist(loc, data[1].p) - data[1].r);
    console.log("tril by points 0 2 3 ", loc, err)
    if (err < bestError) {
        bestError = err;
        bestLocation = loc;
    }

    // w/o point 2
    loc = trilaterate(data[0].p, data[1].p, data[3].p, data[0].r, data[1].r, data[3].r);
    err = Math.abs(dist(loc, data[2].p) - data[2].r);
    console.log("tril by points 0 1 3 ", loc, err)
    if (err < bestError) {
        bestError = err;
        bestLocation = loc;
    }

    // w/o point 3
    loc = trilaterate(data[0].p, data[1].p, data[2].p, data[0].r, data[1].r, data[2].r);
    err = Math.abs(dist(loc, data[3].p) - data[3].r);
    console.log("tril by points 0 1 2 ", loc, err)
    if (err < bestError) {
        bestError = err;
        bestLocation = loc;
    }

    return bestLocation;
}


/**
 * Calculates location based on data and expectation for the location (e.g. based on previous location data)
 * @param data - array of 4 - the data of four listeners
 * @param expectation - point
 */
var getLocation4ListenersExpectation = function(data, expectation) {
    const EXPECTATION_ERROR_WEIGHT = 1;
    const FOURTH_LISTENER_DELTA_ERROR_WEIGHT = 1;


    var bestLocation, bestError = 1e9;

    // w/o point 0
    loc = trilaterate(data[1].p, data[2].p, data[3].p, data[1].r, data[2].r, data[3].r);
    fourthListenerError = Math.abs(dist(loc, data[0].p) - data[0].r);
    expectationError = dist(loc, expectation)
    err = fourthListenerError * FOURTH_LISTENER_DELTA_ERROR_WEIGHT + expectationError * EXPECTATION_ERROR_WEIGHT;
    console.log("tril by points 0 1 2 ", loc, err)
    if (err < bestError) {
        bestError = err;
        bestLocation = loc;
    }


    // w/o point 1
    loc = trilaterate(data[0].p, data[2].p, data[3].p, data[0].r, data[2].r, data[3].r);
    fourthListenerError = Math.abs(dist(loc, data[1].p) - data[1].r);
    expectationError = dist(loc, expectation)
    err = fourthListenerError * FOURTH_LISTENER_DELTA_ERROR_WEIGHT + expectationError * EXPECTATION_ERROR_WEIGHT;
    console.log("tril by points 0 2 3 ", loc, err)
    if (err < bestError) {
        bestError = err;
        bestLocation = loc;
    }

    // w/o point 2
    loc = trilaterate(data[0].p, data[1].p, data[3].p, data[0].r, data[1].r, data[3].r);
    fourthListenerError = Math.abs(dist(loc, data[2].p) - data[2].r);
    expectationError = dist(loc, expectation)
    err = fourthListenerError * FOURTH_LISTENER_DELTA_ERROR_WEIGHT + expectationError * EXPECTATION_ERROR_WEIGHT;
    console.log("tril by points 0 1 3 ", loc, err)
    if (err < bestError) {
        bestError = err;
        bestLocation = loc;
    }

    // w/o point 3
    loc = trilaterate(data[0].p, data[1].p, data[2].p, data[0].r, data[1].r, data[2].r);
    fourthListenerError = Math.abs(dist(loc, data[3].p) - data[3].r);
    expectationError = dist(loc, expectation)
    err = fourthListenerError * FOURTH_LISTENER_DELTA_ERROR_WEIGHT + expectationError * EXPECTATION_ERROR_WEIGHT;
    console.log("tril by points 0 1 2 ", loc, err)
    if (err < bestError) {
        bestError = err;
        bestLocation = loc;
    }

    return bestLocation;
}

demo = function () {
    let P1 = {x: 7, y: 7, z: 0};
    let P2 = {x: 12, y: 10, z: 0};
    let P3 = {x: 12, y: 7, z: 0};
    let P4 = {x: 7, y: 10, z: 0};

// let P1DiffP2x = P2.x - P1.x;
// let P1DiffP3x = P3.x - P1.x;
// let P1DiffP3y = P3.y - P3.y;

// let P1Prime = {x: 0, y: 0, z: 0};
    let P2Prime = {x: P2.x - P1.x, y: P2.y - P1.y, z: P2.z - P1.z};
    let P3Prime = {x: P3.x - P1.x, y: P3.y - P1.y, z: P3.z - P1.z};

// https://www.easycalculation.com/analytical/distance.php
// Above webpage is used to calculate sample distances to listeners
    var m = trilaterateAlgo(P1, P3Prime, P2Prime, 5.36, 8.6, 7.28);
// var m = trilaterate(P1, P3Prime, P2Prime, 5.36, 8.6, 8.28);

    console.log(trilaterate(P1, P3, P2, 5.36, 8.6, 7.28))

    console.log(m);

    var data = [
        {
            p: P1,
            r: 5.36
        },
        {
            p: P3,
            r: 8.6
        },
        {
            p: P2,
            r: 7.28
        },
        {
            p: P4,
            r: 10
        }
    ];

    var loc = getLocation4Listeners(data);
    console.log("location by 4 listeners: ", loc)
    console.log("location by 4 listener with expecation", getLocation4ListenersExpectation(data, {x: 7, y: 10}))
}

demo();