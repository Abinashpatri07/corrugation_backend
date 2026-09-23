const validatePurchaseOrder = (req, res, next) => {
  const body = req.body || {};

  /*
   * vendor_id is required because the database
   * has vendor_id BIGINT NOT NULL.
   */
  if (
    body.vendor_id === undefined ||
    body.vendor_id === null ||
    body.vendor_id === ""
  ) {
    return res.status(400).json({
      success: false,
      message: "Vendor is required.",
    });
  }

  /*
   * vendor_id must be a valid number.
   */
  if (Number.isNaN(Number(body.vendor_id))) {
    return res.status(400).json({
      success: false,
      message: "Invalid vendor_id.",
    });
  }

  /*
   * PO date is mandatory because the database
   * has po_date DATE NOT NULL.
   */
  if (!body.po_date) {
    return res.status(400).json({
      success: false,
      message: "Order date is required.",
    });
  }

  /*
   * Items must be an array.
   */
  if (!Array.isArray(body.items)) {
    return res.status(400).json({
      success: false,
      message: "Items must be an array.",
    });
  }

  /*
   * At least one item should be supplied.
   */
  if (body.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one item is required.",
    });
  }

  /*
   * Validate every item.
   */
  for (let i = 0; i < body.items.length; i++) {
    const item = body.items[i];

    if (item.quantity === undefined || item.quantity === null) {
      return res.status(400).json({
        success: false,
        message: `Quantity is required for item ${i + 1}.`,
      });
    }

    if (Number(item.quantity) < 0) {
      return res.status(400).json({
        success: false,
        message: `Quantity cannot be negative for item ${i + 1}.`,
      });
    }

    if (item.unit_rate === undefined || item.unit_rate === null) {
      return res.status(400).json({
        success: false,
        message: `Rate is required for item ${i + 1}.`,
      });
    }

    if (Number(item.unit_rate) < 0) {
      return res.status(400).json({
        success: false,
        message: `Rate cannot be negative for item ${i + 1}.`,
      });
    }
  }

  next();
};

module.exports = {
  validatePurchaseOrder,
};