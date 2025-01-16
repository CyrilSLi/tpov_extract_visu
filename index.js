#! /usr/bin/env node

if (process.argv.length !== 3) {
    console.log("Please provide exactly one argument, the path to a stop data JSON file.");
    process.exit(1);
}

const fs = require("node:fs");
const http = require("node:http");
const open = require("open");
const readline = require("node:readline");
const { Transform } = require("node:stream");
const url = require("node:url");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var stopData;
class textReplace extends Transform {
    constructor() {
        super();
    }
    _transform(chunk, encoding, callback) {
        this.push(chunk.toString().replace("%stopData%", btoa(stopData)));
        callback();
    }
}

function servePage() {
    http.createServer(function (req, res) {
        var reqUrl = url.parse(req.url, true);
        if (reqUrl.pathname === "/") {
            res.writeHead(200, {"Content-Type": "text/html"});
            fs.createReadStream("index.html").pipe(new textReplace).pipe(res);
        }
    }).listen(0, function () {
        console.log("Serving on http://localhost:" + this.address().port);
        rl.question("Open in browser? (Type anything to skip) ", ans => {
            if (ans === "") {
                open("http://localhost:" + this.address().port);
            }
            rl.close();
        });
    });
}

fs.readFile(process.argv[2], "utf8", function (err, data) {
    if (err) {
        if (err.code === "ENOENT") {
            console.log("File '" + process.argv[2] + "' not found.");
            process.exit(1);
        } else {
            throw err;
        }
    }
    stopData = JSON.stringify(JSON.parse(data));
    servePage();
});