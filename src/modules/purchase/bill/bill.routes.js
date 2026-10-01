/*
 * Bill Routes
 */

const express = require("express");

const controller = require("./bill.controller");

const router = express.Router();


/*
 * Create Bill
 */
router.post(
  "/",
  controller.createBill
);


/*
 * Get all Bills
 */
router.get(
  "/",
  controller.getAllBills
);


/*
 * Get Bill by ID
 */
router.get(
  "/:id",
  controller.getBillById
);


module.exports = router;