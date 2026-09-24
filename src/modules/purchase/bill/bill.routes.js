const express = require('express');
const router = express.Router();
const controller = require('./bill.controller');

router.get('/', controller.getAllBills);
router.get('/:id', controller.getBillById);

module.exports = router;
