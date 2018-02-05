import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import express from "express";
import data from "./data.json";
import Sequelize from "sequelize";

var bodyParser = require("body-parser");
var db = new Sequelize("webporter", "root", "password", {
  host: "localhost",
  dialect: "mysql",

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operatorsAliases: false
});

const app = express();
app.set("view engine", "pug");

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get("/", async function(req, res) {
  return res.render("index", { data });
});

app.get("/exports.json", async function(req, res) {
  const query = `{
    allRequests {
      id
      title
      description
    }
  }`;

  fetch(`http://localhost:3000/?query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(json => res.json(json));
});

app.get("/export", async (req, res) => {
  const query = `{
    Request(id: ${req.query.id}) {
      Parameters {
        name
        type
        label
      }
    }
  }`;

  fetch(`http://localhost:3000/?query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(json => res.json(json));
});

app.post("/export", async (req, res) => {
  const query = `{
    Request(id: ${req.body.export_id}) {
      query
    }
  }`;

  fetch(`http://localhost:3000/?query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(json => json.data.Request.query)
    .then(query => {
      // @TODO: auto-replacement
      db
        .query(query, {
          replacements: req.body.team ? { team: req.body.team.split(',') } : {},
          type: Sequelize.QueryTypes.SELECT
        })
        .then(data => {
          var json2csv = require("json2csv");
          var fields = Object.keys(data[0]);
          var csv = json2csv({ data, fields, fieldNames: fields });
          fs.writeFile(`public/export_${req.body.export_id}.csv`, csv, function(
            writerException
          ) {
            if (writerException) throw writerException;
            res.send(`http://127.0.0.1:3001/export_${req.body.export_id}.csv`);
          });
        });
    });
});

app.use(express.static("public"));

const port = process.env.PORT || 3001;

app.listen(port, err => {
  if (err) {
    console.error(err);
  }

  if (__DEV__) {
    // webpack flags!
    console.log("> in development");
  }

  console.log(`> listening on port ${port}`);
});
