function createTables(db) {
    // describe all tables
    const tables = {
    q1:
    [`CREATE TABLE IF NOT EXISTS 431_FANSHOP.User (
        uid INT PRIMARY KEY,
        lname VARCHAR(25),
        fname VARCHAR(25),
        role VARCHAR(5),
        username VARCHAR(20)
    );`,
    "Error creating user table: "
    ],
    q2:
    [`CREATE TABLE 'Cart'(
      'cart_ID' int NOT NULL AUTO_INCREMENT,
      'uid' int unsigned NOT NULL,
      'product_ID' int NOT NULL,
      PRIMARY KEY ('cart_ID','uid','product_ID'),
      KEY 'cart_idx' ('uid'),
      CONSTRAINT 'cart' FORIEGN KEY ('uid') REFRENCES 'User' ('user_ID')
    );`,
    "Error Creating Cart Table: "
    ]

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

