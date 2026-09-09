const express = require('express');
const cors = require('cors');

const customerRoutes =
    require('./modules/customer/customer.routes');

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

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// =====================================================
// API ROUTES
// =====================================================

app.use(
    '/api/v1/customers',
    customerRoutes
);


// =====================================================
// ERROR HANDLER
// =====================================================

app.use(errorMiddleware);


module.exports = app;