const repository = require('./purchase.repository');

async function getAllPurchaseOrders() {
    return await repository.getAllPurchaseOrders();
}

async function getPurchaseOrderById(id) {
    return await repository.getPurchaseOrderById(id);
}

module.exports = {
    getAllPurchaseOrders,
    getPurchaseOrderById
};
