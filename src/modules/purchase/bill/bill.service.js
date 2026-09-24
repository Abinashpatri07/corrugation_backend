const repository = require('./bill.repository');

async function getAllBills() {
    return await repository.getAllBills();
}

async function getBillById(billId) {
    return await repository.getBillById(billId);
}

module.exports = {
    getAllBills,
    getBillById
};
