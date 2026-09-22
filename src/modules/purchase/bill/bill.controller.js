const service = require('./bill.service');

async function getAllBills(req, res, next) {
    try {
        const data = await service.getAllBills();
        res.status(200).json({
            success: true,
            message: 'Bills fetched successfully',
            data
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllBills
};
