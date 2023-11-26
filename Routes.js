const db = require('../index.js');
const express = require('express');
const router = express.Router();

const dbControllers = require('./schema/DML.js');

// Every route located in this file

// insert


// update
router.post('/registeruser', cors() , dbControllers.register);


// read

module.exports = router;