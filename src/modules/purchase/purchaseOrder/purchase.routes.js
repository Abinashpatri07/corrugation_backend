const express = require('express');
const router = express.Router();
const controller = require('./purchase.controller');

router.get('/', controller.getAllPurchaseOrders);
router.get('/:id', controller.getPurchaseOrderById);

module.exports = router;
