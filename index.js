const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const createTables = require('./schema/DDL');
const DatabaseRoutes = require('./Routes.js');
const app = express();
const port = process.env.PORT || 3004;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use('/db', DatabaseRoutes);

// Your routes and database connections will go here.

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const db = mysql.createConnection({
    host: 'localhost', // MariaDB server host
    user: 'root', // Database Username
    password: 'lacrosse25', // Database Password
    database: '431_FANSHOP' // database name
});

db.connect((err) => {
    if (err){
        console.error('Database Connection Failed: ' + err.message);
    } else {
        console.log('Connected to the database');
    }
});

try {
    const insertProduct = `INSERT INTO 431_FANSHOP.Product (gender, title, details, team, color, size) VALUES (?,?,?,?,?,?)`
    db.query(
        insertProduct,
        ['male','shirt','shortsleeve','eagles','green','medium']
    );
}catch(error){
    console.error("Error:",error);
}

// createTables(db);



module.exports = db;

