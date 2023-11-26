const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const createTables = require('./schema/DDL');
const DatabaseRoutes = require('./Routes.js');
const app = express();
const port = process.env.PORT || 3004;
const {connectDatabase} = require('./DB_INIT.js');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use('/db', DatabaseRoutes);

// Your routes and database connections will go here.

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


connectDatabase();




