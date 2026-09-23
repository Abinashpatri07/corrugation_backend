/*
 * Bill Validation
 */

const validateCreateBill = (data) => {

  const errors = [];

  if (!data) {
    errors.push("Bill data is required.");
    return errors;
  }

  if (!data.purchaseOrderId) {
    errors.push("Purchase Order ID is required.");
  }

  if (!data.vendorId) {
    errors.push("Vendor ID is required.");
  }

  if (!data.billDate) {
    errors.push("Bill date is required.");
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push("At least one bill item is required.");
  }

  if (Array.isArray(data.items)) {
    data.items.forEach((item, index) => {

      if (!item.quantity || Number(item.quantity) <= 0) {
        errors.push(
          `Item ${index + 1}: quantity must be greater than 0.`
        );
      }

      if (
        item.unitRate === undefined ||
        item.unitRate === null ||
        Number(item.unitRate) < 0
      ) {
        errors.push(
          `Item ${index + 1}: unit rate is required.`
        );
      }
    });
  }

  return errors;
};


module.exports = {
  validateCreateBill
};