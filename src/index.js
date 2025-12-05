const app = require('./app');
const db = require('./data-access/models');
const config = require('./config');

const PORT = config.port || 3000;

const start = async () => {
  try {
    // authenticate DB connection
    await db.sequelize.authenticate();
    console.log('DB connected');

    // If you want to auto-sync models to DB (dev only), you can use sync({ force: false })
    // We are not forcing to avoid dropping tables.
    await db.sequelize.sync({ alter: false });
    console.log('Models synchronized');

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
};

start();
