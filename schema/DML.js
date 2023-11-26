const db = require('../index.js');

// Adds record to User table and Password table
exports.addUser = async (req, res) => {
    const { email, fname, lname, password } = req.body;
    console.log('hello');

    const insertUser = `INSERT INTO User (email, fname, lname, sign_date) VALUES (?,?,?,NOW())`;
    const insertPassword = `INSERT INTO Password (id , password) VALUES (?,?)`;
    try {

        // ensures integrity of system incase of failure of first request
        db.beginTransaction();

        const [userResult] = db.query(
            insertUser,
            [email,fname,lname]
        );

        const userId = userResult.insertId;

        db.query(
            insertPassword,
            [userId, password]
        );

        db.commit();

        res.status(201).json({user_ID: userId, message: 'User Signed Up'});
    } catch (error) {
        // undo previous updates from this transaction
        db.rollback();
        console.error('Error registering user:',error);
        res.status(500).json({message: error});
    }
}