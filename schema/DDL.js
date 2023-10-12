function createTables(db) {
    // describe all tables
    const tables = {
    q1:
    [`CREATE TABLE IF NOT EXISTS user (
        uid INT PRIMARY KEY,
        lname VARCHAR(25),
        fname VARCHAR(25),
        role VARCHAR(5),
        username VARCHAR(20)
    );`,
    "Error creating user table: "
    ],

    // fill in missing tables with structure above

    

    }


    // initialize all of above tables
    for ( const key in tables){
        const data = tables[key];
        console.log(data);
        const q = data[0];
        const e = data[1];
        db.query(q, (err) => {
            if (err) {
                console.log(e, err.message);
            }
        })
    }
}

module.exports = createTables;

