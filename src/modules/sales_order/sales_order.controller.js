const salesOrderService = require('./sales_order.service');

async function convertQuoteToSO(req, res) {
    try {
        const { quoteId } = req.params;
        if (!quoteId) {
            return res.status(400).json({ error: 'Quote ID is required' });
        }

        const result = await salesOrderService.createSalesOrderFromQuote(quoteId);
        res.status(201).json({
            message: 'Sales Order created successfully',
            data: result
        });
    } catch (error) {
        console.error('Error converting quote to SO:', error);
        res.status(500).json({
            error: 'Failed to convert quote to Sales Order',
            details: error.message
        });
    }
}

async function getAllSalesOrders(req, res) {
    try {
        const salesOrders = await salesOrderService.getAllSalesOrders();
        res.status(200).json(salesOrders);
    } catch (error) {
        console.error('Error fetching sales orders:', error);
        res.status(500).json({
            error: 'Failed to fetch sales orders',
            details: error.message
        });
    }
}

async function getSalesOrderById(req, res) {
    try {
        const { id } = req.params;
        const salesOrder = await salesOrderService.getSalesOrderById(id);
        
        if (!salesOrder) {
            return res.status(404).json({ error: 'Sales Order not found' });
        }

        res.status(200).json(salesOrder);
    } catch (error) {
        console.error('Error fetching sales order by ID:', error);
        res.status(500).json({
            error: 'Failed to fetch sales order',
            details: error.message
        });
    }
}

module.exports = {
    convertQuoteToSO,
    getAllSalesOrders,
    getSalesOrderById
};
