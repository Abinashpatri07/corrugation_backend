const customerService = require('./customer.service');

async function createCustomer(req, res, next) {

    try {

        const result =
            await customerService.createCustomer(req.body);

        return res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: result
        });

    } catch (error) {

        next(error);
    }
}

module.exports = {
    createCustomer
};