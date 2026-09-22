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

async function getPurchaseOrderById(req, res, next) {
    try {
        const { id } = req.params;
        const data = await service.getPurchaseOrderById(id);
        
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Purchase order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Purchase order fetched successfully',
            data
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllPurchaseOrders,
    getPurchaseOrderById
};
