const express = require('express');
const router = express.Router();
const cors = require('cors');
const dbControllers = require('./schema/DML.js');

// Every route located in this file

// authentication
router.get('/authentication', cors() , dbControllers.login);

// insert
router.post('/registeruser', cors() , dbControllers.addUser);

// update
router.post('/updateProfile', cors() , dbControllers.updateUser);

// delete
router.post('/deleteAccount', cors() , dbControllers.deleteUser)

// read
router.get('/player', cors() , dbControllers.searchByPlayer);
router.get('/team', cors() , dbControllers.searchByTeam);
router.get('/product', cors() , dbControllers.getProduct);
router.get('/jerseys', cors() , dbControllers.getJerseys);
router.get('/user', cors() , dbControllers.getUser);

module.exports = router;