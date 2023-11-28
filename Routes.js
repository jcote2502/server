const express = require('express');
const router = express.Router();
const cors = require('cors');
const dbControllers = require('./schema/DML.js');

// Every route located in this file

// authentication
router.get('/authentication', cors() , dbControllers.login);

// insert
router.post('/registeruser', cors() , dbControllers.addUser); // done
router.post('/addSearch', cors() , dbControllers.addRecentSearch); 
router.post('/addItem', cors() , dbControllers.addCartItem); 
router.post('/purchase', cors() , dbControllers.createTransaction); 
router.post('/addRefund', cors() , dbControllers.addRefund);

// update
router.post('/updateProfile', cors() , dbControllers.updateUser); // done

// delete
router.post('/deleteAccount', cors() , dbControllers.deleteUser) // done
router.post('/clearSearches', cors() , dbControllers.clearSearches);
router.post('/clearCart', cors() , dbControllers.clearCart); 
router.post('/removeCartItem', cors() , dbControllers.removeCartItem); 

// read
router.get('/player', cors() , dbControllers.searchByPlayer); // done
router.get('/team', cors() , dbControllers.searchByTeam); // done
router.get('/product', cors() , dbControllers.getProduct); // done
router.get('/jerseys', cors() , dbControllers.getJerseys); // done
router.get('/user', cors() , dbControllers.getUser); // done
router.get('/cart', cors() , dbControllers.getUserCart);
router.get('/searches', cors(), dbControllers.getSearches);
router.get('/refund', cors() , dbControllers.getRefunds);
router.get('/transactions', cors() , dbControllers.getTransactions); // done

module.exports = router;