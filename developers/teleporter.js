'use strict';
// starpebble for bytecubed
const Graph=require('graph-data-structure');
const fs=require('fs');

const graph = Graph();

if (process.argv.length < 3) {
  console.warn("Please provide a file name as an argument");
  process.exit();
}

function readGraph(lines) {
  for (var line of lines) {
    if (line.match('^.+ - .+$')) {
      try {
        var gregex = /^(.+) - (.+)$/;
        var myArray = gregex.exec(line);
        if (myArray && myArray.length === 3) {
          var [l,cityFrom,cityTo] = myArray;
          if (cityFrom !== cityTo) {
            graph.addEdge(cityFrom, cityTo);
            graph.addEdge(cityTo, cityFrom);            
          }
          else {
            console.warn('⚠️  Warning: Ignoring graph request where the from and to city are the same name: ' + line);
          }
        }
      }
      catch(e) {
        console.log('My app had a problem reading this graph definition: ' + line);
      }
    }
  }
};

function citiesnjumps(city,distance) {
  var visited = new Set();
  var tovisit = [];
  var reachable = new Set();
  tovisit.push(city);
  for (var i = 0; i < distance; i++) {
//            console.log(tovisit);
    var newtovisit = new Set();
    tovisit.forEach(v => {
      var adjacent = graph.adjacent(v);
//              console.log(adjacent);
      visited.add(v);
      adjacent.forEach(a => {
        reachable.add(a);
        if (!visited.has(a)) {
          newtovisit.add(a);
        }
      });
    });
    tovisit = Array.from(newtovisit);
  }
  if (reachable.has(city)) {
    reachable.delete(city);
  }
  return Array.from(reachable);
}

function canteleport(cityFrom, cityTo) {
  var haspath = false;
  try {
    var path = graph.shortestPath(cityFrom,cityTo);
    var haspath = true;
  }
  catch(e) {}
  return haspath;
}

function cityhasloop(city) {
  var hasloop = false;

  var adjacent = graph.adjacent(city);
  adjacent.forEach(a => {
    graph.removeEdge(a,city);
    var haspath = false;
    try {
      var path = graph.shortestPath(a,city);
      hasloop = true;
    }
    catch(e) {}
    graph.addEdge(a,city)
  });

  return hasloop;
}

function answerQuestions(lines) {
  for (var line of lines) {
    //example: cities from Summerton in 1 jumps
    var citiesregex = /^cities from (.+) in (\d+) jumps$/;
    var myArray = citiesregex.exec(line);
    if (myArray && myArray.length === 3) {
      var [l,city,distance] = myArray;
      var cities = citiesnjumps(city,distance);
      console.log(`${line}: ` + Array.from(cities).join(', ') );
    }

    //example: can I teleport from Springton to Atlantis
    var canteleportregex = /^can I teleport from (.+) to (.+)$/;
    myArray = canteleportregex.exec(line);
    if (myArray && myArray.length === 3) {
      var [l,cityFrom,cityTo] = myArray;
      var haspath = canteleport(cityFrom,cityTo);
      console.log(`${line}: ${(haspath) ? 'yes' : 'no'}`)
    }

    //example: loop possible from Oaktown: yes
    var looppossible = /^loop possible from (.+)$/;
    myArray = looppossible.exec(line);
    if (myArray && myArray.length === 2) {
      var city = myArray[1];
      var hasloop = cityhasloop(city);
      console.log(`${line}: ${(hasloop) ? 'yes' : 'no'}`);
    }
  }
}

const filename = process.argv[2];
fs.readFile(filename, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var lines = data.split('\n');
  lines = lines.filter(l => l.length > 0);
  if (lines.length) {
    readGraph(lines);
    answerQuestions(lines);
  } else {
    console.warn('⚠️  Warning: There is no data in this file.');
  }
});
