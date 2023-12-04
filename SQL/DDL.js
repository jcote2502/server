function createTables(DB,DB_NAME,callback) {
    // describe all tables
    const tables = {
    q1:
    [`CREATE TABLE IF NOT EXISTS ${DB_NAME}.User (
        user_ID int unsigned NOT NULL AUTO_INCREMENT,
        email varchar(45) NOT NULL,
        fname varchar(45) NOT NULL,
        lname varchar(45) NOT NULL,
        team varchar(45) DEFAULT NULL,
        pr_address varchar(45) DEFAULT NULL,
        sign_date datetime NOT NULL,
        PRIMARY KEY (user_ID),
        UNIQUE KEY email_UNIQUE (email)
      );`,
    "Error creating user table: "
    ],
    q2:
    [`CREATE TABLE IF NOT EXISTS ${DB_NAME}.Ledger (
        trans_ID int unsigned NOT NULL AUTO_INCREMENT,
        user_ID int unsigned NOT NULL,
        PRIMARY KEY (trans_ID,user_ID),
        KEY userid_idx (user_ID),
        CONSTRAINT userid FOREIGN KEY (user_ID) REFERENCES ${DB_NAME}.User (user_ID) ON DELETE CASCADE
      );`,
    "Error Creating Ledger Table: "
    ],
    q3:
    [`CREATE TABLE IF NOT EXISTS ${DB_NAME}.Password (
        id int unsigned NOT NULL,
        password varchar(45) NOT NULL,
        PRIMARY KEY (id,password),
        CONSTRAINT userPASS_ID FOREIGN KEY (id) REFERENCES ${DB_NAME}.User (user_ID) ON DELETE CASCADE ON UPDATE RESTRICT
      );`,
    "Error Creating Password Table: "
    ],
    q4:
    [`CREATE TABLE IF NOT EXISTS ${DB_NAME}.Product (
        product_ID int NOT NULL AUTO_INCREMENT,
        gender varchar(45) NOT NULL,
        title varchar(45) NOT NULL,
        details varchar(45) DEFAULT NULL,
        player int DEFAULT NULL,
        team varchar(45) NOT NULL,
        color varchar(45) NOT NULL,
        size varchar(45) NOT NULL,
        price decimal(10,2) NOT NULL,
        PRIMARY KEY (product_ID)
      );`,
    "Error Creating Product Table: "
    ],
    q5:
    [`CREATE TABLE IF NOT EXISTS ${DB_NAME}.Player (
        player int NOT NULL,
        fname varchar(45) DEFAULT NULL,
        lname varchar(45) DEFAULT NULL,
        team varchar(45) DEFAULT NULL,
        position varchar(45) DEFAULT NULL,
        PRIMARY KEY (player)
      );`,
    "Error Creating Player Table: "
    ],
    q6:
    [`CREATE TABLE IF NOT EXISTS ${DB_NAME}.Cart (
        cart_ID int NOT NULL AUTO_INCREMENT,
        uid int unsigned NOT NULL,
        product_ID int NOT NULL,
        PRIMARY KEY (cart_ID,uid,product_ID),
        KEY cart_idx (uid),
        CONSTRAINT cart FOREIGN KEY (uid) REFERENCES ${DB_NAME}.User (user_ID)
      );`,
    "Error Creating Cart Table: "
    ],
    q7:
    [`CREATE TABLE IF NOT EXISTS ${DB_NAME}.Transaction (
        trans_ID int unsigned NOT NULL AUTO_INCREMENT,
        total decimal(10,2) NOT NULL,
        pdate datetime NOT NULL,
        PRIMARY KEY (trans_ID),
        CONSTRAINT transx FOREIGN KEY (trans_ID) REFERENCES ${DB_NAME}.Ledger (trans_ID) ON DELETE CASCADE
      );`,
    "Error Creating Transaction Table: "
    ],
    q8:
    [`CREATE TABLE IF NOT EXISTS ${DB_NAME}.Transaction_Info (
        sales_no int unsigned NOT NULL AUTO_INCREMENT,
        product_ID int unsigned NOT NULL,
        trans_ID int unsigned NOT NULL,
        PRIMARY KEY (sales_no,product_ID,trans_ID),
        KEY info_idx (trans_ID),
        CONSTRAINT info FOREIGN KEY (trans_ID) REFERENCES ${DB_NAME}.Transaction (trans_ID) ON DELETE CASCADE
      );`,
    "Error Creating Transaction_Info Table: "
    ],
    q9:
    [`CREATE TABLE IF NOT EXISTS ${DB_NAME}.Refund (
        rfnd_ID int unsigned NOT NULL AUTO_INCREMENT,
        user_ID int unsigned NOT NULL,
        trans_ID int unsigned NOT NULL,
        product_ID int unsigned NOT NULL,
        rdate datetime NOT NULL,
        PRIMARY KEY (rfnd_ID,user_ID),
        KEY uid_idx (user_ID),
        CONSTRAINT refund FOREIGN KEY (user_ID) REFERENCES ${DB_NAME}.User (user_ID) ON DELETE CASCADE ON UPDATE RESTRICT
      );`,
    "Error Creating Refund Table: "
    ]
    };

    let numTablesProcessed = 0;

    // initialize all of above tables
    for ( const key in tables){
        const data = tables[key];
        const q = data[0];
        const e = data[1];
        DB.query(q, (err) => {
            if (err) {
                console.log(e, err.message);
                process.exit(1);
            }
            numTablesProcessed++;

            if (numTablesProcessed === Object.keys(tables).length){
                if (callback && typeof callback === 'function'){
                    callback();
                }
            }
        });
    }
}

module.exports = createTables;

