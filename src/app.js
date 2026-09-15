const express = require('express');
const cors = require('cors');


// =====================================================
// ROUTES
// =====================================================

const customerRoutes =
    require('./modules/customer/customer.routes');

const vendorRoutes =
    require('./modules/vendor/vendor.routes');


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
//
// Base URL:
//
// /api/v1/customers
//
// Examples:
//
// GET  /api/v1/customers
// POST /api/v1/customers
// GET  /api/v1/customers/:customerId
// -----------------------------------------------------

app.use(
    '/api/v1/customers',
    customerRoutes
);


// -----------------------------------------------------
// VENDOR ROUTES
// -----------------------------------------------------
//
// Base URL:
//
// /api/v1/vendors
//
// Examples:
//
// GET  /api/v1/vendors
// POST /api/v1/vendors
// GET  /api/v1/vendors/:vendorId
// -----------------------------------------------------

app.use(
    '/api/v1/vendors',
    vendorRoutes
);


// =====================================================
// ERROR HANDLER
// =====================================================
//
// This must remain AFTER all API routes so that errors
// thrown by Customer/Vendor controllers and services
// are passed to the centralized error middleware.
// =====================================================

app.use(
    errorMiddleware
);


module.exports = app;