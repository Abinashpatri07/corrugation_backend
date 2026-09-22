const repository = require('./bill.repository');

async function getAllBills() {
    return await repository.getAllBills();
}

module.exports = {
    getAllBills
};
