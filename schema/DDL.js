function createTables(db) {
    // describe all tables
    const tables = {
    q1:
    [`CREATE TABLE IF NOT EXISTS 431_FANSHOP.User (
        'user_ID int unsigned NOT NULL AUTO_INCREMENT,
        'email' varchar(45) NOT NULL,
        'fname' varchar(45) NOT NULL,
        'lname' varchar(45) NOT NULL,
        'team' varchar(45) DEFAULT NULL,
        'pr_address varchar(45) DEFAULT NULL,
        'sign_date' datetime NOT NULL,
        PRIMARY KEY ('user_ID'),
        UNIQUE KEY 'email_UNIQUE ('email')
    );`,
    "Error creating user table: "
    ],
    q2:
    [`CREATE TABLE IF NOT EXISTS 431_FANSHOP.Cart(
      'cart_ID' int NOT NULL AUTO_INCREMENT,
      'uid' int unsigned NOT NULL,
      'product_ID' int NOT NULL,
      PRIMARY KEY ('cart_ID','uid','product_ID'),
      KEY 'cart_idx' ('uid'),
      CONSTRAINT 'cart' FORIEGN KEY ('uid') REFRENCES 'User' ('user_ID')
    );`,
    "Error Creating Cart Table: "
    ],
    q3:
    [`CREATE TABLE IF NOT EXISTS 431_FANSHOP.Password(
        'id' int unsigned NOT NULL,
        'password' varchar(45) NOT NULL,
        PRIMARY KEY ('id','password'),
        CONSTRAINT 'userPASS_ID' FOREIGN KEY ('id') REFERENCES 'User' ('user_ID') ON DELETE CASCADE ON UPDATE RESTRICT
    );`,
    "Error Creating Password Table: "
    ],
    q4:
    [`CREATE TABLE IF NOT EXISTS 431_FANSHOP.Product(
        'product_ID int NOT NULL AUTO_INCREMENT,
        'gender' varchar(45) NOT NULL,
        'title' varchar(45) NOT NULL,
        'details' varchar(45) DEFAULT NULL,
        'player' int DEFAULT NULL,
        'team' varchar(45) NOT NULL,
        'color' varchar(45) NOT NULL,
        'size' varchar(45) NOT NULL,
        'price' decimal(10,2) NOT NULL,
        PRIMARY KEY ('product_ID')

    );`,
    "Error Creating Prodcut Table: "
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

