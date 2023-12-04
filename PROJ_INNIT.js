const mysql = require('mysql2');
const createTables = require('./SQL/DDL.js');
const fs = require('fs');
const csv = require('csv-parser');


// create connection to SQL on localhost
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
});

// connect to SQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        console.log('Exiting script.');
        process.exit(1);
    } else {
        console.log('Connected to MySQL');
    }
});

// create new database in schemas
const databaseName = '431_FANSHOP';
const createDBQuery = `CREATE DATABASE IF NOT EXISTS ${databaseName}`;

// Create The Database
connection.query(createDBQuery, (err) => {
    if (err) {
        console.error('Error creating database:', err);
        console.log('Exiting script.');
        process.exit(1);
    } else {
        console.log(`Database ${databaseName} created.`);
        // Connect to the newly created schema after creating the database
        const DB = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'lacrosse25',
            database: databaseName,
        });

        DB.connect((err) => {
            if (err) {
                console.error('Error connecting to the database:', err);
                console.log('Exiting script.');
                process.exit(1);
            } else {
                console.log(`Connected to Database '${databaseName}'.`);
                // Now call the function to create tables
                createTables(DB, databaseName, () => {
                    console.log('Successfully added all tables');

                    importProductData(DB);
                    importPlayerData(DB);
                });
            }
        });
    }
});

function importProductData(myConnection) {
    const file_path = './product_table.csv';
    const rows = [];

    fs.createReadStream(file_path)
        .pipe(csv())
        .on('data', (row) => {
            const product = {
                product_id: parseInt(row.product_id),
                gender: row.gender,
                title: row.title,
                details: row.details,
                player: row.player === 'Null' ? null : parseInt(row.player),
                team: row.team,
                color: row.color,
                size: row.size,
                price: parseFloat(row.price),
            };
            rows.push(product);
        })
        .on('end', async () => {
            try {
                // Iterate over each row and insert into the product table
                for (const product of rows) {
                    const insertQuery = `
                        INSERT INTO ${databaseName}.Product
                        (product_id, gender, title, details, player, team, color, size, price)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    await myConnection.execute(insertQuery, [
                        product.product_id,
                        product.gender,
                        product.title,
                        product.details,
                        product.player,
                        product.team,
                        product.color,
                        product.size,
                        product.price,
                    ]);
                }

                console.log('All Products inserted successfully.');
            } catch (error) {
                console.error('Error inserting data into product table:', error);
            } finally{
                console.log('FINISHED DATABASE INITILIZATION!!');
                console.log('Press Ctrl+C to quit this process.');
            }
        })
        .on('error', (error) => {
            console.error('Error:', error.message);
        });
}

function importPlayerData(myConnection) {
    const file_path = './player_table.csv';
    const rows = [];

    fs.createReadStream(file_path)
        .pipe(csv())
        .on('data', (row) => {
            const player = {
                player_id: parseInt(row.player_id),
                fname: row.fname,
                lname: row.lname,
                position: row.position,
                team: row.team,
            };
            rows.push(player);
        })
        .on('end', async () => {
            try {
                // Iterate over each row and insert into the Player table
                for (const player of rows) {
                    const insertQuery = `
                        INSERT INTO ${databaseName}.Player
                        (player, fname, lname, team, position)
                        VALUES (?, ?, ?, ?, ?)
                    `;

                    await myConnection.execute(insertQuery, [
                        player.player_id,
                        player.fname,
                        player.lname,
                        player.team,
                        player.position,
                    ]);
                }

                console.log('All Players inserted successfully.');
            } catch (error) {
                console.error('Error inserting data into Player table:', error);
            } 
        })
        .on('error', (error) => {
            console.error('Error:', error.message);
        });
}