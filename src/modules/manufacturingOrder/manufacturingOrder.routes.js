const express = require("express");

const controller = require(
  "./manufacturingOrder.controller"
);

const router = express.Router();

// Convert a Sales Order into a Manufacturing Order.
router.post(
  "/from-sales-order",
  controller.convertFromSalesOrder
);

// List all manufacturing orders.
router.get("/", controller.getAll);

// Get one manufacturing order by database ID or MO number.
router.get("/:id", controller.getById);

// Create a manufacturing order.
router.post("/", controller.create);

// Update manufacturing order details.
router.put("/:id", controller.update);

// Update order status.
router.patch("/:id/status", controller.updateStatus);

module.exports = router;