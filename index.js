#! /usr/bin/env node

if (process.argv.length !== 3) {
    console.log("Please provide exactly one argument, the path to a stop data JSON file.");
    process.exit(1);
}

const Ajv2020 = require("ajv/dist/2020");
const ajv = new Ajv2020({ strict: false });
const fs = require("node:fs");
const http = require("node:http");
const https = require("node:https");
const open = require("open");
const readline = require("node:readline");
const stopDataSchema = require("./stop_data_schema.json");
const { Transform } = require("node:stream");
const url = require("node:url");
const validate = ajv.compile(stopDataSchema);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var tiandituTk;
https.get("https://www.tianditu.gov.cn/", (res) => {
    res.setEncoding("utf8");
    res.on("data", (data) => {
        tiandituTk = /(maptoken.+?")([0-9a-f]+)/.exec(data)[2];
        console.log("Tianditu token ready.");
    }
)});

class textReplace extends Transform {
    constructor() {
        super();
    }
    _transform(chunk, encoding, callback) {
        var ts = this;
        fs.readFile(process.argv[2], "utf8", function (err, data) {
            if (err) {
                if (err.code === "ENOENT") {
                    console.log("File '" + process.argv[2] + "' not found, exiting.");
                    process.exit(1);
                } else {
                    throw err;
                }
            }
            verifyStopData(data);
            ts.push(chunk.toString().replaceAll(
                "%stopData%",
                new TextEncoder().encode(JSON.stringify(JSON.parse(data))).toString()
            ).replaceAll(
                "%tiandituTk%",
                tiandituTk
            ));
            callback();
        });
    }
}

function verifyStopData(data) {
    if (!validate(JSON.parse(data))) {
        console.log("Invalid stop data JSON file:");
        console.log(validate.errors);
        process.exit(1);
    }
}

function servePage(_) {
    http.createServer(function (req, res) {
        var reqUrl = url.parse(req.url, true);
        if (reqUrl.pathname === "/") {
            res.writeHead(200, {"Content-Type": "text/html"});
            fs.createReadStream("index.html").pipe(new textReplace).pipe(res);
        }
    }).listen(5033, function () {
        console.log("Serving on http://localhost:" + this.address().port);
        // open("http://localhost:" + this.address().port);
    });
}

fs.createReadStream("index.html").pipe(new textReplace); // Do tests before serving
servePage();