'use strict';

const fs = require('fs');
const jsonfile = require('jsonfile');

const BEACON_IDS = [
    '99e8d8b3-e074-4abc-a219-8f21d6f4841f',
    'f07b61a9-5ea9-4f5a-ac6c-3c90f025c5e6',
    '948075df-9b16-4b2a-91b6-a91d76dfb585',
    '8d1681e4-4e5c-4daa-bcef-c0aba71098b2',
    'dbfb878c-fec4-41c3-9b47-4eb8f6ee4d10',
    'fcb59194-dbc6-4768-9634-a22d8851de84'
];

const LISTENER_IDS = [
    'Listener_Babyfood',
    'Listener_Tech',
    'Listener_Bakery',
    'Listener_Alcohol'
];

let now = new Date();
let yesterday = new Date();
yesterday.setDate(now.getDate() - 1);
let minusTwoHours = new Date();
minusTwoHours.setHours(now.getHours() - 2);

let dailyData = LISTENER_IDS.map(listener => {
    let visits = [];
    let visitsNumber = randomNumberTo(700);
    for (let i = 0; i < visitsNumber; i += 1) {
       visits.push({
           beaconId: BEACON_IDS[randomNumberTo(BEACON_IDS.length - 1)],
           listenerId: listener,
           timestamp: randomDate(yesterday, now)
       });
    }

    return visits;
});

dailyData = [].concat.apply([], dailyData);
// const listenerPerSample = [].concat.apply([], listenersPerTracker);

let randomTimeStampsNumber = randomNumberTo(120);
let randomTimestamps = [];
for (let i = 0; i < randomTimeStampsNumber; i += 1) {
    randomTimestamps.push(randomDate(yesterday, now));
}

// let attendanceData = LISTENER_IDS.map(listener => {
//       let data = [];

//       randomTimestamps.forEach(timestamp => {
//           let attendance = randomNumberTo(20);
//           data.push({
//               listenerId: listener,
//               attendance,
//               timestamp
//           });
//       });

//       return data;
// });

// attendanceData = [].concat(attendanceData);

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomNumberTo(n) {
    return Math.floor(Math.random() * (n + 1));
}

jsonfile.spaces = 4;
jsonfile.writeFile('./daily.json', { daily: dailyData }, console.error);
// jsonfile.writeFile('./attendance.json', { attendanceData }, console.error);
