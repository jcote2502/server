const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const createTables = require('./schema/DDL');
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Your routes and database connections will go here.

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const db = mysql.createConnection({
    host: 'localhost', // MariaDB server host
    user: 'root', // Database Username
    password: 'password', // Database Password
    database: 'database_name' // database name
});

db.connect((err) => {
    if (err){
        console.error('Database Connection Failed: ' + err.message);
    } else {
        console.log('Connected to the database');
    }
});

createTables(db);



module.exports = db;

