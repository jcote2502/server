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


// read
router.get('/player', cors() , dbControllers.searchByPlayer);
router.get('/team', cors() , dbControllers.searchByTeam);
router.get('/product', cors() , dbControllers.getProduct);

module.exports = router;