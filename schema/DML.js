const {db} = require('../DB_INIT.js');


// Promise Function Used to Execute Queries
function executeQuery(query, values) {
    return new Promise((resolve, reject) => {
        db.query(query,values,(err,result)=>{
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

//--Authentication

// takes email and password
// returns user_ID
exports.login = async (req, res) => {
    const {email, password} = req.query;
    console.log(email,password);
    const query = `
        SELECT id , fname
        FROM 431_FANSHOP.User
        JOIN 431_FANSHOP.Password ON User.user_ID = Password.id
        WHERE email = ? AND password = ?;
    `;
    try {
        db.query(query, [email,password], (err, results) => {
            if (err) {
                console.error('Error authenticating user:',err);
                res.status(500).json({ error: "Internal Server Error"});
            } else {
                if (results.length>0){
                    const uid = results[0].id;
                    const fname = results[0].fname;
                    console.log('User authenticated. User ID:', uid);
                    res.status(200).json({userId: uid,fname:fname, message: 'User Authenticated'});
                } else {
                    console.log('Invalid email or password.');
                    res.status(401).json({ error: 'Invalid email or password.'});
                }
            }
        }); 
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

//--INSERT CALLS

// Takes email, fname, lname, password
// inserts into user table and password table
// returns user_ID
exports.addUser = async (req, res) => {
    const { email, fname, lname, password } = req.body;
    console.log(email, password);
    const userQuery = `
        INSERT INTO 431_FANSHOP.User (email, fname, lname, sign_date) 
        VALUES (?,?,?,NOW());
    `;
    const passQuery = `
        INSERT INTO 431_FANSHOP.Password (id, password)
        SELECT user_ID, ? FROM 431_FANSHOP.User WHERE email=?;
    `
    const idQuery = `
        SELECT user_ID
        FROM 431_FANSHOP.User
        WHERE email = ?;
    `;
    try {
        await executeQuery(userQuery, [email,fname,lname,password]);
        await executeQuery(passQuery, [password,email]);
        db.query(idQuery, [email], (err, results)=>{
            if (err){
                console.error('Error Fetching UID:',err);
                res.status(500).json({ error: "Internal Server Error"});
            }
            else if (results.length>0){
                console.log(results[0])
                res.status(200).json({uid:results[0] ,message: 'User Signed Up'});
            } else {
                res.status(404).json({ message: 'UID Not Found'});
            }
        })
        console.log('User added to database.');
    } catch (error) {
        console.error('Error registering user:',error);
        res.status(500).json({message: error});
    }
}


//--UPDATE CALLS

// takes team, address, uid
// updates user table with new team or address
exports.updateUser = async (req, res) => {
    const {team, address, uid} = req.body;
    const query = `
        UPDATE 431_FANSHOP.User
        SET team = ?, address = ?
        WHERE user_ID = ?;
    `;

    try {
        await executeQuery(query, [team,address,uid]);
        res.status(200).json({message: 'Successfully updated User.'});
        console.log('Updated User:',uid);
    } catch (error) {
        console.error('Error Updating user:',error);
        res.status(500).json({message: error});
    }
}

//--DELETE CALLS

// takes uid
// deletes user from database
//  -> user , password , ledger , transactions , refund
exports.deleteUser = async (req, res) => {
    const {uid} = req.body;
    const query = `
        DELETE FROM 431_FANSHOP.User
        WHERE user_ID = ?;
    `;
    try {
        executeQuery(query, [uid]);
        console.log("Deleted user :", uid);
        res.status(200).json({message:'successfully deleted user'});
    } catch (error) {
        console.log("Error deleting user :", error);
        res.status(500).json({error:'Internal Server Error'});
    }
}


//--GET CALLS

// takes query string of player name 
// returns product_ID , fname , lname , title , team , color , size , gender 
exports.searchByPlayer = async (req, res) => {
    const {fname, lname} = req.query;
    const query = `
        SELECT P.product_ID, PL.fname, PL.lname, P.title, P.team, P.color, P.size, P.gender
        FROM 431_FANSHOP.Product P
        JOIN 431_FANSHOP.Player PL ON P.player = PL.pid 
        WHERE PL.lname = ? AND PL.fname = ?;
    `;
    try {
        db.query(query, [lname,fname], (err, results) => {
            if (err){
                console.error('Error Fetching Player:',err);
                res.status(500).json({ error: "Internal Server Error"});
            }
            else if (results.length>0){
                res.status(200).json({ products: results });
            } else {
                res.status(404).json({ message: 'Player Not Found'});
            }
        })
    } catch (error){
        console.error('Error during search:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

// takes query string of team name
// returns product_ID, gender, title, size, team, color, fname, lname, details
exports.searchByTeam = async (req, res) => {
    const {team} = req.query;
    const query = `
        SELECT P.product_ID, P.gender, P.title, P.size, P.team, P.color,
        CASE WHEN P.title = 'jersey' THEN PL.fname ELSE NULL END AS fname,
        CASE WHEN P.title = 'jersey' THEN PL.lname ELSE NULL END AS lname,
        CASE WHEN P.title != 'jersey' THEN P.details ELSE NULL END AS details
        FROM 431_FANSHOP.Product P
        LEFT JOIN 431_FANSHOP.Player PL ON P.player = PL.pid
        WHERE P.team = ?;
    `;
    try{
        db.query(query,[team],(err,results)=>{
            if (err){
                console.error('Error searching team:',err);
                res.status(500).json({ error: "Internal Server Error"});
            }
            else if (results.length>0){
                res.status(200).json({ products: results });
            } else {
                res.status(404).json({ message: 'Team Not Found'});
            }
        })
    }catch (error) {
        console.error('Error searching team:',error);
        res.status(500).json({error: 'Internal Server Error'});
    }

}

// takes product id
// returns product_ID, gender, title, size, team, color, fname, lname, details
exports.getProduct = async (req, res) => {
    const {product_ID} = req.query;
    const query = `
        SELECT P.product_ID, P.gender, P.title, P.size, P.team, P.color,
        CASE WHEN P.title = 'jersey' THEN PL.fname ELSE NULL END AS fname,
        CASE WHEN P.title = 'jersey' THEN PL.lname ELSE NULL END AS lname,
        CASE WHEN P.title != 'jersey' THEN P.details ELSE NULL END AS details
        FROM 431_FANSHOP.Product P
        LEFT JOIN 431_FANSHOP.Player PL ON P.player = PL.pid
        WHERE P.product_ID = ?;
    `;
    try{
        db.query(query,[product_ID],(err,results)=>{
            if (err){
                console.error('Error Fetching Product:',err);
                res.status(500).json({ error: "Internal Server Error"});
            }
            else if (results.length>0){
                res.status(200).json({ product: results });
            } else {
                res.status(404).json({ message: 'Product Not Found'});
            }
        })
    }catch (error) {
        console.error('Error fetching product:',error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

// Returns product_ID, gender, title, size, team, color, lname, fname
exports.getJerseys = async (req, res) => {
    const query = `
        SELECT P.product_ID, P.gender, P.title, P.size, P.team, P.color, PL.lname, PL.fname, P.Price
        FROM 431_FANSHOP.Product P
        JOIN 431_FANSHOP.Player PL ON P.player = PL.pid
        WHERE P.size = 'medium'
        LIMIT 50;
    `;
    try{
        db.query(query,[],(err,results)=>{
            if (err){
                console.error('Error Fetching Jerseys:',err);
                res.status(500).json({ error: "Internal Server Error"});
            }
            else if (results.length>0){
                res.status(200).json({ product: results });
            } else {
                res.status(404).json({ message: 'Jerseys Not Found'});
            } 
        })
    }catch (error) {
        console.error('Error fetching Jerseys:',error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

// select user
exports.getUser = async (req , res) => {
    const {uid} = req.query;
    const query = `
        SELECT *
        FROM 431_FANSHOP.User 
        WHERE user_id = ?;
    `;
    db.query(query, [uid], (err, results) => {
        if (err){
            console.log('Error fetching user:',err);
            res.status(500).json({error:'Internal Server Error'});
        } else if (results.length>0){
            res.status(200).json({user:results[0], message:'Success'});
            console.log(results);
        }else {
            res.status(404).json({message: 'User not found'});
        }
    })
}