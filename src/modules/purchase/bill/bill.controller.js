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

async function getBillById(req, res, next) {
    try {
        const { id } = req.params;
        const data = await service.getBillById(id);
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Bill not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Bill fetched successfully',
            data
        });
    } catch (error) {
        next(error);
    }
}

async function createBill(req, res, next) {
    try {
        const billData = req.body;
        const newBill = await service.createBill(billData);
        res.status(201).json({
            success: true,
            message: 'Bill created successfully',
            data: newBill
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllBills,
    getBillById,
    createBill
};
