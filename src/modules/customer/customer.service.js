const pool = require('../../config/database');

const repository = require('./customer.repository');
const { generateCustomerCode } = require('./customer-code');


// =====================================================
// CREATE CUSTOMER
// =====================================================

async function createCustomer(data) {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        const existingPan =
            await repository.findCustomerByPan(
                client,
                data.pan
            );

        if (existingPan) {
            throw new Error(
                `Customer already exists with PAN ${data.pan}`
            );
        }

        if (data.gstin) {

            const existingGstin =
                await repository.findCustomerByGstin(
                    client,
                    data.gstin
                );

            if (existingGstin) {
                throw new Error(
                    `Customer already exists with GSTIN ${data.gstin}`
                );
            }
        }

        const customerCode =
            await generateCustomerCode(client);

        const customer =
            await repository.createCustomer(
                client,
                {
                    ...data,
                    customerCode
                }
            );

        await repository.createAddress(
            client,
            customer.customer_id,
            {
                ...data.billingAddress,
                addressType: 'BILLING'
            }
        );

        await repository.createAddress(
            client,
            customer.customer_id,
            {
                ...data.shippingAddress,
                addressType: 'SHIPPING'
            }
        );

        if (
            data.contacts &&
            data.contacts.length > 0
        ) {

            for (const contact of data.contacts) {

                await repository.createContact(
                    client,
                    customer.customer_id,
                    contact
                );
            }
        }

        if (
            data.bankDetails &&
            data.bankDetails.length > 0
        ) {

            for (const bank of data.bankDetails) {

                await repository.createBankDetails(
                    client,
                    customer.customer_id,
                    bank
                );
            }
        }

        await client.query('COMMIT');

        return {
            customerId: customer.customer_id,
            customerCode: customer.customer_code
        };

    } catch (error) {

        await client.query('ROLLBACK');

        throw error;

    } finally {

        client.release();
    }
}


// =====================================================
// GET CUSTOMER LIST
// =====================================================

async function getCustomers(params) {

    const page =
        Number(params.page) || 1;

    const limit =
        Number(params.limit) || 10;

    const offset =
        (page - 1) * limit;

    const search =
        params.search || '';

    const status =
        params.status || '';

    const sortBy =
        params.sortBy || 'createdAt';

    const sortOrder =
        params.sortOrder || 'desc';


    const result =
        await repository.getCustomers({
            page,
            limit,
            offset,
            search,
            status,
            sortBy,
            sortOrder
        });


    return {
        data: result.rows,

        pagination: {
            page,
            limit,
            totalRecords: result.totalRecords,
            totalPages:
                Math.ceil(result.totalRecords / limit)
        }
    };
}

// =====================================================
// GET CUSTOMER DETAILS
// =====================================================

async function getCustomerDetails(customerId) {

    const customer =
        await repository.getCustomerById(customerId);

    if (!customer) {

        const error =
            new Error('Customer not found');

        error.statusCode = 404;

        throw error;
    }


    const [
        addresses,
        contacts,
        banks,
        summary
    ] = await Promise.all([

        repository.getCustomerAddresses(customerId),

        repository.getCustomerContacts(customerId),

        repository.getCustomerBanks(customerId),

        repository.getCustomerSummary(customerId)

    ]);


    const billingAddress =
        addresses.find(
            address =>
                address.addressType === 'BILLING'
        ) || null;


    const shippingAddress =
        addresses.find(
            address =>
                address.addressType === 'SHIPPING'
        ) || null;


    return {

        customer,

        summary,

        addresses: {
            billing: billingAddress,
            shipping: shippingAddress
        },

        contacts,

        banks

    };
}
// =====================================================
// GET CUSTOMER BOX SPECIFICATIONS
// =====================================================

async function getCustomerBoxSpecifications(customerId) {

    const customer =
        await repository.getCustomerById(customerId);

    if (!customer) {

        const error =
            new Error('Customer not found');

        error.statusCode = 404;

        throw error;
    }

    return await repository.getCustomerBoxSpecifications(
        customerId
    );
}
// =====================================================
// GET CUSTOMER ORDER HISTORY
// =====================================================

async function getCustomerOrderHistory(
    customerId,
    params
) {

    const page =
        Number(params.page) || 1;

    const limit =
        Number(params.limit) || 10;

    const offset =
        (page - 1) * limit;


    const result =
        await repository.getCustomerOrderHistory({
            customerId,
            page,
            limit,
            offset
        });


    return {

        data: result.rows,

        pagination: {
            page,
            limit,

            totalRecords:
                result.totalRecords,

            totalPages:
                Math.ceil(
                    result.totalRecords / limit
                )
        }
    };
}
// =====================================================
// GET CUSTOMER INVOICE
// =====================================================

async function getCustomerInvoice(customerId) {

    const customer =
        await repository.getCustomerById(customerId);

    if (!customer) {

        const error =
            new Error('Customer not found');

        error.statusCode = 404;

        throw error;
    }


    const [
        commercialTerms,
        paymentActivity
    ] = await Promise.all([

        repository.getCustomerCommercialTerms(
            customerId
        ),

        repository.getCustomerPaymentActivity(
            customerId
        )

    ]);


    return {
        commercialTerms,
        paymentActivity
    };
}
module.exports = {
    createCustomer,
    getCustomers,
    getCustomerDetails,
    getCustomerBoxSpecifications,
    getCustomerOrderHistory,
    getCustomerInvoice
};