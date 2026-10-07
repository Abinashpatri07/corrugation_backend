const express = require('express');
const cors = require('cors');

// =====================================================
// ROUTES
// =====================================================

const customerRoutes =
    require('./modules/customer/customer.routes');

const vendorRoutes =
    require('./modules/vendor/vendor.routes');

const quoteRoutes =
    require('./modules/quote/quote.routes');

const salesOrderRoutes =
    require('./modules/sales_order/sales_order.routes');

const purchaseOrderRoutes = require(
    "./modules/purchase/purchaseOrder/purchase.routes"
);

const billRoutes = require("./modules/purchase/bill/bill.routes");

const inventoryRoutes = require("./modules/inventory/inventory.routes");

const machineRoutes =
    require('./modules/machine/machine.routes');

const machineUtilizationRoutes =
    require('./modules/machine/machineUtilization.routes');

// =====================================================
// ERROR HANDLER
// =====================================================

const errorMiddleware =
    require('./middleware/error.middleware');

const app = express();

// =====================================================
// CORS
// =====================================================

app.use(cors({

    origin: 'http://localhost:5173',

    methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS'
    ],

    allowedHeaders: [
        'Content-Type',
        'Authorization'
    ]

}));

// =====================================================
// BODY PARSER
// =====================================================

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);

// =====================================================
// API ROUTES
// =====================================================

// -----------------------------------------------------
// CUSTOMER ROUTES
// -----------------------------------------------------

app.use(
    '/api/v1/customers',
    customerRoutes
);

app.use(
    '/api/v1/quotes',
    quoteRoutes
);

app.use(
    '/api/v1/sales-orders',
    salesOrderRoutes
);

app.use(
    "/api/v1/purchase-orders",
    purchaseOrderRoutes
);

app.use(
    "/api/v1/purchase/bills",
    billRoutes
);

// -----------------------------------------------------
// MACHINE ROUTES
// -----------------------------------------------------

app.use(
    '/api/v1/machines',
    machineRoutes
);

app.use(
    '/api/v1/machines',
    machineUtilizationRoutes
);

// -----------------------------------------------------
// INVENTORY ROUTES
// -----------------------------------------------------

app.use(
    '/api/v1/inventory',
    inventoryRoutes
);

// -----------------------------------------------------
// VENDOR ROUTES
// -----------------------------------------------------

app.use(
    '/api/v1/vendors',
    vendorRoutes
);

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
    errorMiddleware
);

module.exports = app;