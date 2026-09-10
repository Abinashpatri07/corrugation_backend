const service = require('./vendor.service');

function sendError(res, error) {
  console.error(error);
  return res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
  });
}

async function createVendor(req, res) {
  try {
    const vendor = await service.createVendor(req.body);
    return res.status(201).json({ success: true, data: vendor });
  } catch (error) {
    return sendError(res, error);
  }
}

async function listVendors(req, res) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const result = await service.listVendors({
      search: req.query.search || '',
      page,
      limit,
    });

    return res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getVendor(req, res) {
  try {
    const vendor = await service.getVendorById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    return res.json({ success: true, data: vendor });
  } catch (error) {
    return sendError(res, error);
  }
}

async function updateVendor(req, res) {
  try {
    const vendor = await service.updateVendor(req.params.id, req.body);
    return res.json({ success: true, data: vendor });
  } catch (error) {
    return sendError(res, error);
  }
}

async function deleteVendor(req, res) {
  try {
    const deleted = await service.deleteVendor(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Vendor not found' });
    return res.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    return sendError(res, error);
  }
}

async function reelSpecifications(req, res) {
  try {
    const data = await service.getReelSpecifications(req.params.id, req.query.search || '');
    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error);
  }
}

async function orderHistory(req, res) {
  try {
    const data = await service.getOrderHistory(req.params.id, {
      search: req.query.search || '',
      from: req.query.from || null,
      to: req.query.to || null,
    });
    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  createVendor, listVendors, getVendor, updateVendor, deleteVendor,
  reelSpecifications, orderHistory,
};
