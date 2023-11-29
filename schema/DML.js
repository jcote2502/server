const {db} = require('../DB_INIT.js');

// AUTHOR(s): Justin Cote, Liam Garrett
// Contains all DML QUERIES for db interaction

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


// Takes product_ID and user_ID
// returns cartID
exports.addCartItem = async (req, res) =>{
    const {uid} = req.body;
    const query =`
        INSERT INTO 431_FANSHOP.Cart (uid,product_ID)
        VALUES (?,?)
    `;
    try{
    db.query(query, [uid, pid], (err,results)=> {
        if (err){
            console.error('Error Adding to Cart:', err);
            res.status(500).json({error: "Internal Server Error"});
        }
        else{
            res.status(200).json({message: 'Item Added To Cart'});
        }

    });
    }
    catch(error){
        console.error('Error Adding To Cart', error);
        res.status(500).json({error: "Internal Server ERror"});
    }
}

// TODO 
// takes productid userid transid
// add refund record
exports.addRefund = async (req, res) =>{
    const {uid, pid, tid} = req.body;
}

// TODO
// Takes uid
// fetches all records from cart with uid
// sum the price of all records to store
// add new transaction(total,date)
// store generated trans_id
// add trans_id and uid to ledger
// for every product_ID in cart
//      add PID, Trans_ID
// idea join tables and add all at once
exports.createTransaction = async (req, res) => {
    const {uid} = req.body;

    const ledgerQuery = `
        INSERT INTO 431_FANSHOP.Ledger (user_ID)
        VALUES (?);
    `;

    const transIdQuery = `
        SELECT trans_ID
        FROM 431_FANSHOP.Ledger
        WHERE user_ID = ?
        ORDER BY trans_ID DESC
        LIMIT 1;
    `;

    const transactionQuery = `
        INSERT INTO 431_FANSHOP.Transaction (trans_ID, total, pdate)
        SELECT ?, SUM(P.price), NOW()
        FROM 431_FANSHOP.Cart C
        JOIN 431_FANSHOP.Product P ON C.product_ID = P.product_ID
        WHERE C.uid = ?;
    `;

    const cartQuery = `
        SELECT product_ID
        FROM 431_FANSHOP.Cart
        WHERE uid = ?;
    `;

    const transactionInfoQuery = `
        INSERT INTO 431_FANSHOP.Transaction_Info (product_ID, trans_ID)
        VALUES (?,?);
    `;

    try {
        db.query(ledgerQuery, [uid], (err) => {
            if (err) {
                console.error('Error Adding to Ledger:', err);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
        db.query(transIdQuery, [uid], (err, results) => {
            if (err) {
                console.error('Error getting TransID:', err);
                res.status(500).json({ error: "Internal Server Error" });
            } else {
                const transID = results[0].trans_ID;
                db.query(transactionQuery, [transID, uid], (err) => {
                    if (err) {
                        console.error('Error Adding to Transaction:', err);
                        res.status(500).json({ error: "Internal Server Error" });
                    } else {
                        db.query(cartQuery, [uid], (err, cart) => {
                            if (err) {
                                console.error('Error Fetching Cart:', err);
                                res.status(500).json({ error: "Internal Server Error" });
                            } else {
                                const products = cart;
                                for (const product of products) {
                                    db.query(transactionInfoQuery, [product.product_ID, transID], (err, results) => {
                                        if (err) {
                                            console.error('Error Adding to Transaction_INFO:', err);
                                            res.status(500).json({ error: "Internal Server Error" });
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });
        res.status(200).json({ message: 'Purchase Successful' });
    }catch(error){
        console.error('Error Purchasing Items:', error);
        res.status(500).json({ error: "Internal Server Error"});
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




// takes uid
// deletes all records with uid from the table
exports.clearCart = async (req, res) => {
    const { uid } = req.body;
    const query = `
        DELETE FROM 431_FANSHOP.Cart
        WHERE uid = ?;
    `;
    try {
        executeQuery(query, [uid]);
        res.status(200).json({ message: 'successfully cleared cart' });
    } catch (error) {
        console.log("Error clearing cart:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



// takes cartId
// removes that record from table
exports.removeCartItem = async (req, res) => {
    const {cid} = req.body;
    const query = `
        DELETE FROM 431_FANSHOP.Cart
        WHERE cart_ID = ?;
    `;
    try{
        executeQuery(query, [cid]);
        res.status(200).json({ message: 'successfully removed item' });
    }catch(error){
        console.log("Error clearing item from cart:", error);
        res.status(500).json({ error: 'Internal Server Error' });
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
        FROM 431_FANSHOP.Product AS P
        JOIN 431_FANSHOP.Player AS PL ON P.player = PL.player
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

// Takes user_ID
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


// takes uid
// selects all cart items
exports.getUserCart = async (req, res) => {
    try {
        const { uid } = req.query;
        const query = `
            SELECT P.product_ID, P.gender, P.title, P.size, P.team, P.color, PL.lname, PL.fname, P.Price , C.cart_ID
            FROM 431_FANSHOP.Product AS P
            JOIN 431_FANSHOP.Cart AS C ON P.product_ID = C.product_ID
            JOIN 431_FANSHOP.Player AS PL ON PL.player = P.player
            WHERE C.uid = ?
            ORDER BY C.cart_ID DESC;
        `;
        db.query(query, [uid], (err, results) => {
            if (err) {
                console.error('Error fetching cart:', err);
                res.status(500).json({ error: "Internal Server Error" });
            } else {
                res.status(200).json({ cart: results, message: 'Success.' });
            }
        });

    } catch (error) {
        console.error('Error Retrieving Cart:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


// TODO 
// takes uid
// selects all refunds
exports.getRefunds = async (req, res) => {

}

// JOINS FIVE TABLES TO RECORD ALL TRANSACTIONS AND INFORMATION FOR DISPLAY OR USE
// takes uid
// selects all transactions 
exports.getTransactions = async (req, res) => {
    const {uid} = req.query;
    const query = `
        SELECT * 
        FROM 431_FANSHOP.Ledger L
        JOIN 431_FANSHOP.Transaction T ON L.trans_ID = T.trans_ID
        JOIN 431_FANSHOP.User U ON L.user_ID = U.user_ID
        JOIN 431_FANSHOP.Refund R ON L.trans_ID = R.trans_ID 
        JOIN 431_FANSHOP.Product P ON R.product_ID = P.product_ID
        WHERE L.user_ID = ?;
    `;
    db.query(query, [uid], (err, results)=>{
        if (err){
            console.log('Error fetching transactions');
            res.status(500).json({error:'Internal Server Error'});
        }else if (results.length>0){
            res.status(200).json({transactions:results, message:'Success'});
            console.log(results);
        }else {
            res.status(404).json({message: 'Transactions not found'});
        }
    })
}

