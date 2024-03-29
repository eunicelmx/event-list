const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require('fs')
let dirname = "C:/Users/user/OneDrive/Desktop/vs_code_projects/my_projects/event_planner/";

app.listen(3000, () => {
    console.log(__dirname);
    console.log(dirname);
    console.log("Application started and Listening on port 3000");
});

// server your css as static
app.use(express.static(dirname));
// app.use(express.static(__dirname + "/css/index.css"));

app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", (req, res) => {
  // res.sendFile(__dirname + "../html/index.html");
  res.sendFile(dirname + "/html/index.html");
});

app.get("/events/:date", (req, res) => {
  console.log("hello",req.params);
  let date = req.params["date"];
  let fileName = "./files/data.json";
  //check if file exist
  if (!fs.existsSync(fileName)) {
    //create new file if not exist
    fs.closeSync(fs.openSync(fileName, 'w'));
  }

  // read file
  const file = fs.readFileSync(fileName)

  //check if file is empty
  if (file.length == 0) {
  } else {
    const json = JSON.parse(file.toString())
    if(json[date] == undefined) {
      res.status(404).send("no records");
    } else {
      console.log(json[date]);
      res.setHeader('Content-Type', 'application/json');
      // res.send(JSON.stringify(json[date]));
      res.send(json[date]);
    }
    
  }
});

function writeToJSON(filename, data) {
  let msg = "";
  fs.writeFile(filename, data, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        msg = "failed";
        return msg;
    }
    msg = "success";
    console.log("JSON file has been saved.");
    return msg;
  });
}

app.post("/storeData", (req, res) => {
  
  // stringify JSON Object
  let jsonData = req.body;
  let fileName = "./files/data.json";
  //check if file exist
  if (!fs.existsSync(fileName)) {
    //create new file if not exist
    fs.closeSync(fs.openSync(fileName, 'w'));
  }

  // read file
  const file = fs.readFileSync(fileName)

  //check if file is empty
  if (file.length == 0) {
    //add data to json file
    //rearrange
    let dateKey = jsonData.date;
    let rearrangeData = {}
    rearrangeData[dateKey] = [{
      "time" : jsonData.time,
      "event" : jsonData.event
    }];
    let msg = writeToJSON(fileName, JSON.stringify(rearrangeData));
    // let msg = writeToJSON(fileName, JSON.stringify([rearrangeData]));
    res.send(msg);

    // fs.writeFileSync(fileName, JSON.stringify([jsonData]))
  } else {
    //append data to jso file
    const json = JSON.parse(file.toString())
    //add json element to json object
    // if dateKey doesnt exist, create dateKey
    // else push to array in dateKey
    let date = jsonData.date;
    console.log(date);
    let rearrangeData = {
      "time" : jsonData.time,
      "event" : jsonData.event
    };
    if(json[date] == undefined) {
      json[date] = [rearrangeData];
    } else {
      //sort here
      json[date].push(rearrangeData);
      let tempArr = json[date];
      tempArr.sort((objA, objB) => {
        if(objA["time"] > objB["time"]) return 1;
        if(objA["time"] < objB["time"]) return -1;
        return 0;
      })
      console.log("hello", tempArr);
    }
    let msg = writeToJSON(fileName, JSON.stringify(json));
    // res.send(msg);
    res.send(json[date]);
  }
  // // write to json file
  // let jsonData = req.body;
  // let fileName = "./files/data.json";
  // //check if file exist
  // if (!fs.existsSync(fileName)) {
  //   //create new file if not exist
  //   fs.closeSync(fs.openSync(fileName, 'w'));
  // }

  // // read file
  // const file = fs.readFileSync(fileName)

  // //check if file is empty
  // if (file.length == 0) {
  //   //add data to json file
  //   fs.writeFileSync(fileName, JSON.stringify([jsonData]))
  // } else {
  //   //append data to jso file
  //   const json = JSON.parse(file.toString())
  //   //add json element to json object
  //   json.push(jsonData);
  //   fs.writeFileSync(fileName, JSON.stringify(json))
  // }

  // write to mongodb???
})

// const http = require('http');

// const hostname = '127.0.0.1';
// const port = 3000;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/html');
// //   res.write('../html/index.html');
//   res.end();
// //   res.end('Hello World');
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

// server.get("/", (req, res) => {
//     res.sendFile(__dirname + "../html/index.html");
// });