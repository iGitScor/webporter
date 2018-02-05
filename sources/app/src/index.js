import fs from 'fs';
import fetch from 'node-fetch';
import express from 'express';
import Sequelize from 'sequelize';

var bodyParser = require('body-parser');
var json2csv = require('json2csv');

var db = new Sequelize('webporter', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql',

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
app.set('view engine', 'pug');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', async (req, res) => res.render('index'));

app.get('/exports.json', async (req, res) => {
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

app.get('/export', async (req, res) => {
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

app.post('/export', async (req, res) => {
  const query = `{
    Request(id: ${req.body.export_id}) {
      query
    }
  }`;

  fetch(`http://localhost:3000/?query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(json => json.data.Request.query)
    .then((_query) => {
      // @TODO: auto-replacement
      db
        .query(_query, {
          replacements: req.body.team ? { team: req.body.team.split(',') } : {},
          type: Sequelize.QueryTypes.SELECT
        })
        .then((data) => {
          var fields = Object.keys(data[0]);
          var csv = json2csv({ data, fields, fieldNames: fields });
          fs.writeFile(
            `public/export_${req.body.export_id}.csv`,
            csv,
            (writerException) => {
              if (writerException) throw writerException;
              res.send(`http://127.0.0.1:3001/export_${req.body.export_id}.csv`);
            }
          );
        });
    });
});

app.use(express.static('public'));

const port = process.env.PORT || 3001;

app.listen((_port, err) => {
  if (err) {
    console.error(err);
  }

  // eslint-disable-next-line no-undef
  if (__DEV__) {
    // webpack flags!
    console.log('> in development');
  }

  console.log(`> listening on port ${port}`);
});
