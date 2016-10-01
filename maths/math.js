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
var trilaterate = function(p1, p2, p3, r1, r2, r3) {
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
	// 	return null;
	// } else if (D == 0) {
	// 	return [{x: x, y: y, z: p1.z}];
	// } else if (D > 0) {
	// 	let z = Math.sqrt(D);
	// 	return [{x: x, y: y, z: z + p1.z},
	// 			{x: x, y: y, z: -z + p1.z}];
	// }
}

let P1 = {x: 7, y: 7, z: 0};
let P2 = {x: 12, y: 10, z: 0};
let P3 = {x: 12, y: 7, z: 0};

// let P1DiffP2x = P2.x - P1.x;
// let P1DiffP3x = P3.x - P1.x;
// let P1DiffP3y = P3.y - P3.y;

// let P1Prime = {x: 0, y: 0, z: 0};
let P2Prime = {x: P2.x - P1.x, y: P2.y - P1.y, z: P2.z - P1.z};
let P3Prime = {x: P3.x - P1.x, y: P3.y - P1.y, z: P3.z - P1.z};

// https://www.easycalculation.com/analytical/distance.php
// Above webpage is used to calculate sample distances to listeners
var m = trilaterate(P1, P3Prime, P2Prime, 5.36, 8.6, 7.28);
// var m = trilaterate(P1, P3Prime, P2Prime, 5.36, 8.6, 8.28);

console.log(m);
