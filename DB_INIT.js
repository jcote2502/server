const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost', // MariaDB server host
    user: 'root', // Database Username
    password: 'password', // Database Password
    database: '431_FANSHOP' // database name
});

function connectDatabase (){
    db.connect((err) => {
        if (err){
            console.error('Database Connection Failed: ' + err.message);
        } else {
            console.log('Connected to the database');
        }
    });
}

module.exports = {
    db: db,
    connectDatabase: connectDatabase
};