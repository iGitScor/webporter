import fs from 'fs';
import fetch from 'node-fetch';
import express from 'express';
import Sequelize from 'sequelize';

const bodyParser = require('body-parser');
const json2csv = require('json2csv');

// @TODO: dotenv
const GQL_SERVER = process.env.GQL || 'http://localhost:3000';

const db = new Sequelize('webporter', 'root', 'password', {
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

  fetch(`${GQL_SERVER}/?query=${encodeURIComponent(query)}`)
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

  fetch(`${GQL_SERVER}/?query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(json => res.json(json));
});

app.post('/export', async (req, res) => {
  const query = `{
    Request(id: ${req.body.export_id}) {
      query
    }
  }`;

  fetch(`${GQL_SERVER}/?query=${encodeURIComponent(query)}`)
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
          const fields = Object.keys(data[0]);
          const csv = json2csv({ data, fields, fieldNames: fields });
          fs.writeFile(
            `public/export_${req.body.export_id}.csv`,
            csv,
            (writerException) => {
              if (writerException) throw writerException;
              res.send(`/export_${req.body.export_id}.csv`);
            }
          );
        });
    });
});

app.use(express.static('public'));

const port = process.env.PORT || 3001;

app.listen(port, (err) => {
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
