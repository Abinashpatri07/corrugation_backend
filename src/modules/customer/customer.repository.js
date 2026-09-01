async function createCustomer(client, data) {

    const query = `
        INSERT INTO customer (
            customer_code,
            customer_type,
            primary_contact_prefix,
            primary_contact_first_name,
            primary_contact_last_name,
            display_name,
            company_name,
            customer_language,
            email,
            primary_phone,
            secondary_phone,
            pan,
            gstin,
            msme,
            sales_region_id,
            currency_code,
            opening_balance,
            payment_terms_id,
            status
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15,
            $16, $17, $18, $19
        )
        RETURNING customer_id, customer_code;
    `;

    const values = [
        data.customerCode,
        data.customerType,
        data.primaryContactPrefix,
        data.primaryContactFirstName,
        data.primaryContactLastName,
        data.displayName,
        data.companyName,
        data.customerLanguage,
        data.emailAddress,
        data.primaryNumber,
        data.secondaryNumber,
        data.pan,
        data.gstin,
        data.msme,
        data.salesRegionId,
        data.currencyCode,
        data.openingBalance,
        data.paymentTermsId,
        'ACTIVE'
    ];

    const result = await client.query(query, values);

    return result.rows[0];
}
async function createAddress(client, customerId, address) {

    const query = `
        INSERT INTO customer_addresses (
            customer_id,
            address_type,
            attention,
            country,
            street_1,
            street_2,
            city,
            district,
            state,
            zip_code,
            phone
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10, $11
        )
        RETURNING customer_address_id;
    `;

    const values = [
        customerId,
        address.addressType,
        address.attention,
        address.country,
        address.street1,
        address.street2,
        address.city,
        address.district,
        address.state,
        address.zipCode,
        address.phone
    ];

    const result = await client.query(query, values);

    return result.rows[0];
}
async function createContact(client, customerId, contact) {

    const query = `
        INSERT INTO customer_contacts (
            customer_id,
            contact_name,
            email_address,
            mobile_number,
            designation,
            is_primary
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING customer_contact_id;
    `;

    const values = [
        customerId,
        contact.name,
        contact.emailAddress,
        contact.mobileNumber,
        contact.designation,
        contact.isPrimary || false
    ];

    const result = await client.query(query, values);

    return result.rows[0];
}
async function createBankDetails(client, customerId, bank) {

    const query = `
        INSERT INTO customer_bank_details (
            customer_id,
            bank_name,
            account_holder,
            account_number,
            ifsc_code,
            is_primary
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING customer_bank_id;
    `;

    const values = [
        customerId,
        bank.bankName,
        bank.accountHolder,
        bank.accountNumber,
        bank.ifscCode,
        bank.isPrimary || false
    ];

    const result = await client.query(query, values);

    return result.rows[0];
}

async function findCustomerByPan(client, pan) {
    const result = await client.query(
        `SELECT customer_id, customer_code
         FROM customer
         WHERE pan = $1`,
        [pan]
    );

    return result.rows[0];
}

async function findCustomerByGstin(client, gstin) {

    if (!gstin) {
        return null;
    }

    const result = await client.query(
        `SELECT customer_id, customer_code
         FROM customer
         WHERE gstin = $1`,
        [gstin]
    );

    return result.rows[0];
}

module.exports = {
    createCustomer,
    createAddress,
    createContact,
    createBankDetails,
    findCustomerByPan,
    findCustomerByGstin
};