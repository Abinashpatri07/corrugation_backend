const pool = require('../../config/database');
const repository = require('./vendor.repository');
const { generateVendorCode } = require('./vendor-code');

async function createVendor(data) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (await repository.findVendorByPan(client, data.pan)) {
      const error = new Error('Vendor with this PAN already exists');
      error.status = 409;
      throw error;
    }

    if (data.gstin && await repository.findVendorByGstin(client, data.gstin)) {
      const error = new Error('Vendor with this GSTIN already exists');
      error.status = 409;
      throw error;
    }

    const vendor = await repository.createVendor(client, {
      ...data,
      vendor_code: await generateVendorCode(client),
    });

    for (const item of data.addresses || []) await repository.createAddress(client, vendor.vendor_id, item);
    for (const item of data.contacts || []) await repository.createContact(client, vendor.vendor_id, item);
    for (const item of data.banks || []) await repository.createBank(client, vendor.vendor_id, item);
    for (const item of data.documents || []) await repository.createDocument(client, vendor.vendor_id, item);
    for (const item of data.reel_specifications || []) await repository.createReelSpecification(client, vendor.vendor_id, item);

    await client.query('COMMIT');
    return getVendorById(vendor.vendor_id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getVendorById(id) {
  const client = await pool.connect();
  try {
    const vendor = await repository.findVendorById(client, id);
    if (!vendor) return null;

    const [addresses, contacts, banks, documents, reelSpecifications, orderHistory, summary] =
      await Promise.all([
        repository.getVendorAddresses(client, id),
        repository.getVendorContacts(client, id),
        repository.getVendorBanks(client, id),
        repository.getVendorDocuments(client, id),
        repository.getReelSpecifications(client, id),
        repository.getOrderHistory(client, id),
        repository.getVendorSummary(client, id),
      ]);

    return {
      ...vendor,
      addresses,
      contacts,
      banks,
      documents,
      reel_specifications: reelSpecifications,
      order_history: orderHistory,
      summary,
    };
  } finally {
    client.release();
  }
}

async function listVendors(params) {
  const client = await pool.connect();
  try {
    return repository.listVendors(client, params);
  } finally {
    client.release();
  }
}

async function updateVendor(id, data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (data.pan && await repository.findVendorByPan(client, data.pan, id)) {
      const error = new Error('Vendor with this PAN already exists');
      error.status = 409;
      throw error;
    }

    if (data.gstin && await repository.findVendorByGstin(client, data.gstin, id)) {
      const error = new Error('Vendor with this GSTIN already exists');
      error.status = 409;
      throw error;
    }

    const vendor = await repository.updateVendor(client, id, data);
    if (!vendor) {
      const error = new Error('Vendor not found');
      error.status = 404;
      throw error;
    }

    await client.query('COMMIT');
    return getVendorById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getReelSpecifications(id, search) {
  const client = await pool.connect();
  try {
    return repository.getReelSpecifications(client, id, search);
  } finally {
    client.release();
  }
}

async function getOrderHistory(id, params) {
  const client = await pool.connect();
  try {
    return repository.getOrderHistory(client, id, params);
  } finally {
    client.release();
  }
}

async function deleteVendor(id) {
  const client = await pool.connect();
  try {
    return repository.deleteVendor(client, id);
  } finally {
    client.release();
  }
}

module.exports = {
  createVendor, getVendorById, listVendors, updateVendor,
  getReelSpecifications, getOrderHistory, deleteVendor,
};
