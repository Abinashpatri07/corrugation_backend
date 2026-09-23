// /*
//  * Purchase Order Routes
//  */

// /*
//  * Purchase Order Routes
//  */

// const express = require("express");

// const router = express.Router();


// // Controller
// const controller = require("./purchase.controller");


// // Validation
// const {
//   validatePurchaseOrder,
// } = require("./purchase.validation");


// // ======================================================
// // CREATE PURCHASE ORDER
// // POST /api/v1/purchase-orders
// // ======================================================

// router.post(
//   "/",
//   validatePurchaseOrder,
//   controller.createPurchaseOrder
// );


// // ======================================================
// // GET ALL PURCHASE ORDERS
// // GET /api/v1/purchase-orders
// // ======================================================

// router.get(
//   "/",
//   controller.getAllPurchaseOrders
// );

// router.get(
//   "/vendor/:vendorId/addresses",
//   controller.getVendorAddressesForPurchaseOrder
// );
// // ======================================================
// // GET SINGLE PURCHASE ORDER
// // GET /api/v1/purchase-orders/:id
// // ======================================================

// router.get(
//   "/:id",
//   controller.getPurchaseOrderById
// );


// // ======================================================
// // DELETE PURCHASE ORDER
// // DELETE /api/v1/purchase-orders/:id
// // ======================================================

// router.delete(
//   "/:id",
//   controller.deletePurchaseOrder
// );


// // ======================================================
// // EXPORT ROUTER
// // ======================================================

// module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('./purchase.controller');

router.post(
    '/',
    controller.createPurchaseOrder
);
router.get('/', controller.getAllPurchaseOrders);
router.get('/:id', controller.getPurchaseOrderById);

module.exports = router;