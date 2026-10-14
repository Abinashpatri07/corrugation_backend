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

const manufacturingOrderRoutes = require(
  "./modules/manufacturingOrder/manufacturingOrder.routes"
);

// =====================================================
// ERROR HANDLER
// =====================================================

const errorMiddleware =
    require('./middleware/error.middleware');

const app = express();

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,         // Set this in Render env variables
].filter(Boolean);

app.use(cors({

    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },

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
// HEALTH CHECK
// =====================================================

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'CORNEX Backend is running!',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'CORNEX Backend is healthy!',
        timestamp: new Date().toISOString()
    });
});

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

// -----------------------------------------------------
// MANUFACTURING ORDER ROUTES
// -----------------------------------------------------

app.use(
  "/api/v1/manufacturing-orders",
  manufacturingOrderRoutes
);

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
    errorMiddleware
);

module.exports = app;