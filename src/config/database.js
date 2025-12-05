const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: 'postgres',
  logging: false
});

module.exports = sequelize;
