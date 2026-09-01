const pool = require('../../config/database');

const repository = require('./customer.repository');
const { generateCustomerCode } = require('./customer-code');

async function createCustomer(data) {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        // ----------------------------------
        // 1. Check duplicate PAN
        // ----------------------------------

        const existingPan =
            await repository.findCustomerByPan(client, data.pan);

        if (existingPan) {
            throw new Error(
                `Customer already exists with PAN ${data.pan}`
            );
        }

        // ----------------------------------
        // 2. Check duplicate GSTIN
        // ----------------------------------

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

        // ----------------------------------
        // 3. Generate customer code
        // ----------------------------------

        const customerCode =
            await generateCustomerCode(client);

        // ----------------------------------
        // 4. Create customer
        // ----------------------------------

        const customer =
            await repository.createCustomer(
                client,
                {
                    ...data,
                    customerCode
                }
            );

        // ----------------------------------
        // 5. Create billing address
        // ----------------------------------

        await repository.createAddress(
            client,
            customer.customer_id,
            {
                ...data.billingAddress,
                addressType: 'BILLING'
            }
        );

        // ----------------------------------
        // 6. Create shipping address
        // ----------------------------------

        await repository.createAddress(
            client,
            customer.customer_id,
            {
                ...data.shippingAddress,
                addressType: 'SHIPPING'
            }
        );

        // ----------------------------------
        // 7. Create contacts
        // ----------------------------------

        if (data.contacts && data.contacts.length > 0) {

            for (const contact of data.contacts) {

                await repository.createContact(
                    client,
                    customer.customer_id,
                    contact
                );
            }
        }

        // ----------------------------------
        // 8. Create bank accounts
        // ----------------------------------

        if (data.bankDetails &&
            data.bankDetails.length > 0) {

            for (const bank of data.bankDetails) {

                await repository.createBankDetails(
                    client,
                    customer.customer_id,
                    bank
                );
            }
        }

        // ----------------------------------
        // 9. Commit transaction
        // ----------------------------------

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

module.exports = {
    createCustomer
};