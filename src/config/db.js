const config = require('./index');
const { Pool } = require('pg');

const pool = new Pool({
  host: config.dbHost,
  port: config.dbPort,
  user: config.username,
  password: config.password,
  database : config.database
});

pool 
  .connect()
  .then(() => console.log("DB Connected!"))
  .catch((err)=> console.error("DB conncetion error: ",err));

module.exports = pool;
