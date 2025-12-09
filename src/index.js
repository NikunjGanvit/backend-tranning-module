require("dotenv").config();
const app = require("./app");
const config = require('../config/config')

const PORT = process.env.PORT || config.port || 3000;

    
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
