// /*
//  * Purchase Order Controller
//  *
//  * Controller receives HTTP requests and
//  * sends HTTP responses.
//  */

// const service = require("./purchase.service");


// /*
//  * POST /api/v1/purchase-orders
//  *
//  * Create a new Purchase Order.
//  */
// const createPurchaseOrder = async (req, res) => {
//   try {

//     const purchaseOrder =
//       await service.createPurchaseOrder(req.body);


//     return res.status(201).json({
//       success: true,
//       message: "Purchase Order created successfully.",
//       data: purchaseOrder,
//     });

//   } catch (error) {

//     console.error(
//       "Create Purchase Order Controller Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to create Purchase Order.",
//       error:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : undefined,
//     });
//   }
// };


// /*
//  * GET /api/v1/purchase-orders
//  *
//  * Get all Purchase Orders.
//  */
// const getAllPurchaseOrders = async (req, res) => {
//   try {

//     const purchaseOrders =
//       await service.getAllPurchaseOrders();


//     return res.status(200).json({
//       success: true,
//       data: purchaseOrders,
//     });

//   } catch (error) {

//     console.error(
//       "Get Purchase Orders Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch Purchase Orders.",
//     });
//   }
// };


// /*
//  * GET /api/v1/purchase-orders/:id
//  *
//  * Get one Purchase Order.
//  */
// const getPurchaseOrderById = async (req, res) => {
//   try {

//     const { id } = req.params;


//     if (!id || Number.isNaN(Number(id))) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid Purchase Order ID.",
//       });
//     }


//     const purchaseOrder =
//       await service.getPurchaseOrderById(id);


//     if (!purchaseOrder) {
//       return res.status(404).json({
//         success: false,
//         message: "Purchase Order not found.",
//       });
//     }


//     return res.status(200).json({
//       success: true,
//       data: purchaseOrder,
//     });

//   } catch (error) {

//     console.error(
//       "Get Purchase Order Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch Purchase Order.",
//     });
//   }
// };


// /*
//  * DELETE /api/v1/purchase-orders/:id
//  */
// const deletePurchaseOrder = async (req, res) => {
//   try {

//     const { id } = req.params;


//     if (!id || Number.isNaN(Number(id))) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid Purchase Order ID.",
//       });
//     }


//     const deleted =
//       await service.deletePurchaseOrder(id);


//     if (!deleted) {
//       return res.status(404).json({
//         success: false,
//         message: "Purchase Order not found.",
//       });
//     }


//     return res.status(200).json({
//       success: true,
//       message: "Purchase Order deleted successfully.",
//       data: deleted,
//     });

//   } catch (error) {

//     console.error(
//       "Delete Purchase Order Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete Purchase Order.",
//     });
//   }
// };

// /*
//  * GET /api/v1/purchase-orders/vendor/:vendorId/addresses
//  *
//  * Get billing and shipping address of a vendor
//  * for Purchase Order creation.
//  *
//  * NOTE:
//  * This is Purchase Order functionality.
//  * Vendor controller is NOT changed.
//  */
// const getVendorAddressesForPurchaseOrder = async (req, res) => {

//   try {

//     const { vendorId } = req.params;


//     if (!vendorId || Number.isNaN(Number(vendorId))) {

//       return res.status(400).json({
//         success: false,
//         message: "Invalid Vendor ID.",
//       });

//     }


//     const addresses =
//       await service.getVendorAddressesForPurchaseOrder(
//         vendorId
//       );


//     return res.status(200).json({
//       success: true,
//       message: "Vendor addresses fetched successfully.",
//       data: addresses,
//     });

//   } catch (error) {

//     console.error(
//       "Get Vendor Addresses For Purchase Order Error:",
//       error
//     );


//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch vendor addresses.",
//       error:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : undefined,
//     });
//   }
// };


// module.exports = {
//   createPurchaseOrder,
//   getAllPurchaseOrders,
//   getPurchaseOrderById,
//   deletePurchaseOrder,
//   getVendorAddressesForPurchaseOrder,
// };

const service = require('./purchase.service');




async function createPurchaseOrder(req, res, next) {
    try {

        console.log(
            'Create Purchase Order Request:',
            req.body
        );

        const data =
            await service.createPurchaseOrder(req.body);

        res.status(201).json({
            success: true,
            message: 'Purchase order created successfully',
            data
        });

    } catch (error) {

        console.error(
            'Create Purchase Order Controller Error:',
            error
        );

        next(error);
    }
}


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
    createPurchaseOrder,
    getAllPurchaseOrders,
    getPurchaseOrderById
};