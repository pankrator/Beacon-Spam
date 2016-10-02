"use strict";
var Genetic = require('./Genetic.js')
var Task = Genetic
    , options = { getRandomSolution : getRandomSolution
    , popSize : 50
    , stopCriteria : stopCriteria
    , fitness : fitness
    , minimize : false
    , mutateProbability : 0.1
    , mutate : mutate
    , crossoverProbability : 0.3
    , crossover : crossover
}
    , util = require('util')



// node 0 is the start and the end vertex
var numVerts = 5;

var graph = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
];


//graph = [ ];
//for(var i = 0; i < numVerts; i++) {
//    graph[i] = [];
//}
//
//for(var i = 0; i < numVerts; i++) {
//    for(var j = i; j < numVerts; j++) {
//        graph[i][j] = Math.random()*30;
//        graph[j][i] = Math.random()*30;
//    }
//}



//setEdge(0, 1, 2);
//setEdge(0, 2, 1);
//setEdge(1, 2, 3);
//setEdge(1, 3, 2);
//setEdge(2, 3, 1);
//
//setEdge(0, 3, 10000);


function crossover(parent1, parent2, callback) {
    var child = {};
    child.data = [];

    //console.log("co: ", parent1, parent2)


    var i = Math.floor(Math.random()*parent1.data.length);
    var j = i;
    while(j == i) j = Math.floor(Math.random()*parent1.data.length);

    if(j < i) {
        let t = i;
        i = j;
        j = t;
    }


    //console.log("crossover ", i, j)
    var used = [];

    for(var k = 0; k < parent1.data.length; k++) {
        if(i <= k && k <= j) {
            child.data[k] = parent1.data[k];
            used[child.data[k]] = true
        }
    }

    var childIdx = 0;
    while(!!child.data[childIdx] && childIdx < parent1.data.length) childIdx++;

    for(var k = 0; k < parent1.data.length; k++) {
        if(!used[parent2.data[k]]) {
            child.data[childIdx] = parent2.data[k];
            used[parent2.data[k]] = true
            while(!!child.data[childIdx] && childIdx < parent1.data.length) childIdx++;
        }
    }

    callback(child)
}


//crossover([1, 2, 3, 4, 5], [4, 5, 3, 1, 2], console.log);


function mutate(solution, callback) {
    var i = Math.floor(Math.random()*solution.data.length);
    var j = i;
    while(j == i) j = Math.floor(Math.random()*solution.data.length);

    if(j < i) {
        let t = i;
        i = j;
        j = t;
    }


    // swap them
    var _t = solution.data[i];
    solution.data[i] = solution.data[j];
    solution.data[j] = _t;

    callback(solution)
}

var shuffle = function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function getRandomSolution(callback) {

    var solution = {};
    solution.data = [];
    for(var i = 1; i < numVerts; i++) {
        solution.data.push(i);
    }

    solution.data = shuffle(solution.data)


    //var solution = { a: Math.random(), b: Math.random(), c: Math.random() }
    callback(solution)
}



function stopCriteria() {
    return (this.generation == 1000)
}

function fitness(solution, callback) {
    var path = getEdge(0, solution.data[0]);

    for(var i = 1; i < solution.data.length; i++) {
        path += getEdge(solution.data[i-1], solution.data[i]);
       // console.log(solution.data[i-1], solution.data[i], getEdge(solution.data[i-1], solution.data[i]));
        //console.log()
    }

    path += getEdge(solution.data[numVerts-2], 0);

    callback(1e9 - path);

}

//console.log('=== TEST BEGINS === ')

// t.on('run start', function () { console.log('run start'); util.log('run') })
// t.on('run finished', function (results) { console.log('run finished - ', results); util.log('run')})
// t.on('init start', function () { console.log('init start') })
// t.on('init end', function (pop) { console.log('init end', pop) })
// t.on('loop start', function () { console.log('loop start') })
// t.on('loop end', function () { console.log('loop end') })
// t.on('iteration start', function (generation) { console.log('iteration start - ',generation) })
// t.on('iteration end', function () { console.log('iteration end') })
// t.on('calcFitness start', function () { console.log('calcFitness start') })
// t.on('calcFitness end', function (pop) { console.log('calcFitness end', pop) })
// t.on('parent selection start', function () { console.log('parent selection start') })
// t.on('parent selection end', function (parents) { console.log('parent selection end ',parents) })
// t.on('reproduction start', function () { console.log('reproduction start') })
//
// t.on('find sum', function () { console.log('find sum') })
// t.on('find sum end', function (sum) { console.log('find sum end', sum) })

// t.on('statistics', function (statistics) { console.log('statistics',statistics)})
//
// t.on('normalize start', function () { console.log('normalize start') })
// t.on('normalize end', function (normalized) { console.log('normalize end',normalized) })
// t.on('child forming start', function () { console.log('child forming start') })
// t.on('child forming end', function (children) { console.log('child forming end',children) })
// t.on('child selection start', function () { console.log('child selection start') })
// t.on('child selection end', function (population) { console.log('child selection end',population) })
//
// t.on('mutate', function () { console.log('MUTATION!') })
//
//
// t.on('reproduction end', function (children) { console.log('reproduction end',children) })
//

/**
 * adj matrix, where
 *   a[i][i] = 0 for all i
 *   a[i][j] = Infinity where path from i to j doesn't exist
 * @param graph
 */
var findAllDistances = function(graph) {
    var numv = graph.length

    for (var k = 0; k < numv; k++)
        for (var i = 0; i < numv; i++)
            for (var j = 0; j < numv; j++)
               if (graph[i][j] > graph[i][k] + graph[k][j])
                   graph[i][j] = graph[i][k] + graph[k][j]
}


// sebset - array of indexes
var subgraph = function(graph, subset) {
    var newGraph = [];
    var nv = subset.length;

    for(var i = 0; i < nv; i++) newGraph[i] = [];

    for(var i = 0; i < nv; i++) {
        for(var j = 0; j < nv; j++) {
            newGraph[i][j] = graph[subset[i]][subset[j]]
        }
    }

    return newGraph
}




var setEdge = function(u, v, w) {
    graph[u][v] = w;
    graph[v][u] = w;
}

var getEdge = function(u, v) {
    return graph[u][v]
}


var dist = function(p1, p2) {
    let dx = p1.x - p2.x;
    let dy = p1.y - p2.y;
    return Math.sqrt(dx*dx + dy*dy)
};


var replaceByCenters = function (coords) {
    let newCoord = util.copycoords;
    for(let key in coords) {
        let newX = coords[key].x + coords[key].width/2;
        let newY = coords[key].y + coords[key].height/2;

        coords[key] = {
            x: newX,
            y: newY
        };
    }
};


var getRouteByCoords = function(coords, callback) {
    replaceByCenters(coords);
    numVerts = Object.keys(coords).length;

    var idNameMapping = Object.keys(coords);

    graph = [];
    for(i = 0; i < numVerts; i++) graph[i] = [];

    for(var i = 0; i < numVerts; i++) {
        for(var j = 0; j < numVerts; j++) {
            graph[i][j] = dist(coords[idNameMapping[i]], coords[idNameMapping[j]]);
        }
    }

    var t = new Task(options)

//t.on('statistics', function (statistics) { console.log('statistics', 1e9 - statistics.maxScore)})

    t.on('error', function (error) { console.log('ERROR - ', error) })
    t.run(function (stats) {
        var res = stats.max.data.map(function (id) {
            return idNameMapping[id];
        });
        res.splice(0, 0, idNameMapping[0]);
        res.push(idNameMapping[0])
        callback(res)
        //console.log('results', 1e9 - stats.maxScore, stats.max.data)}
    })
}


var getRoute = function(callback) {
    numVerts = 5;

    graph = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
    ];

    var idNameMapping = ["Scene", "BabyFood", "Alcohol", "Bakery", "Tech"];

    setEdge(0, 1, 2)
    setEdge(0, 2, 2.5)
    setEdge(0, 3, 4.5)
    setEdge(0, 4, 4.5)
    setEdge(1, 2, 4)
    setEdge(1, 3, 3.5)
    setEdge(1, 4, 4)
    setEdge(2, 3, 10)
    setEdge(2, 4, 2)
    setEdge(3, 4, 8)


    var t = new Task(options)

//t.on('statistics', function (statistics) { console.log('statistics', 1e9 - statistics.maxScore)})

    t.on('error', function (error) { console.log('ERROR - ', error) })
    t.run(function (stats) {
        var res = stats.max.data.map(function (id) {
            return idNameMapping[id];
        });
        res.splice(0, 0, idNameMapping[0]);
        res.push(idNameMapping[0])
        callback(res)
        //console.log('results', 1e9 - stats.maxScore, stats.max.data)}
    })
}

//getRoute(console.log);


module.exports.getRoute = getRoute;
module.exports.getRouteByCoords = getRouteByCoords;
