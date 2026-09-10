const express = require('express');
const controller = require('./vendor.controller');
const { validate, createVendorSchema, updateVendorSchema } = require('./vendor.validation');

const router = express.Router();

router.post('/', validate(createVendorSchema), controller.createVendor);
router.get('/', controller.listVendors);
router.get('/:id', controller.getVendor);
router.put('/:id', validate(updateVendorSchema), controller.updateVendor);
router.delete('/:id', controller.deleteVendor);

router.get('/:id/reel-specifications', controller.reelSpecifications);
router.get('/:id/order-history', controller.orderHistory);

module.exports = router;