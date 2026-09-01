const express = require('express');

const customerRoutes =
    require('./modules/customer/customer.routes');

const errorMiddleware =
    require('./middleware/error.middleware');

const app = express();

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// API routes

app.use(
    '/api/v1/customers',
    customerRoutes
);

// Error handler

app.use(errorMiddleware);

module.exports = app;