const repository = require('./purchase.repository');

async function getAllPurchaseOrders() {
    return await repository.getAllPurchaseOrders();
}

module.exports = {
    getAllPurchaseOrders
};
