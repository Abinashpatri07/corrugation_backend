const repository = require('./bill.repository');

async function getAllBills() {
    return await repository.getAllBills();
}

async function getBillById(billId) {
    return await repository.getBillById(billId);
}

async function createBill(billData) {
    return await repository.createBill(billData);
}

module.exports = {
    getAllBills,
    getBillById,
    createBill
};
