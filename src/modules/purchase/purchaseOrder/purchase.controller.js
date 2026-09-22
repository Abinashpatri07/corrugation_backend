const service = require('./purchase.service');

async function getAllPurchaseOrders(req, res, next) {
    try {
        const data = await service.getAllPurchaseOrders();
        res.status(200).json({
            success: true,
            message: 'Purchase orders fetched successfully',
            data
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllPurchaseOrders
};
