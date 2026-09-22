const express = require('express');
const router = express.Router();
const controller = require('./bill.controller');

router.get('/', controller.getAllBills);

module.exports = router;
