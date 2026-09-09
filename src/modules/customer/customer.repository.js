const pool = require('../../config/database');
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
async function getCustomers({
    page,
    limit,
    offset,
    search,
    status,
    sortBy,
    sortOrder
}) {

    const values = [];

    let whereConditions = `
        WHERE 1 = 1
    `;


    // =====================================================
    // SEARCH
    // =====================================================

    if (search) {

        values.push(`%${search}%`);

        whereConditions += `
            AND (
                c.display_name ILIKE $${values.length}
                OR c.gstin ILIKE $${values.length}
                OR c.email ILIKE $${values.length}
                OR c.primary_phone ILIKE $${values.length}
                OR CONCAT(
                    c.primary_contact_first_name,
                    ' ',
                    c.primary_contact_last_name
                ) ILIKE $${values.length}
            )
        `;
    }


    // =====================================================
    // STATUS
    // =====================================================

    if (status) {

        values.push(status);

        whereConditions += `
            AND c.status = $${values.length}
        `;
    }


    // =====================================================
    // SORT COLUMN WHITELIST
    // =====================================================

    const sortColumnMap = {

        displayName: 'c.display_name',
        gstin: 'c.gstin',
        email: 'c.email',
        phone: 'c.primary_phone',
        status: 'c.status',
        createdAt: 'c.created_at'
    };


    const orderColumn =
        sortColumnMap[sortBy] ||
        'c.created_at';


    const orderDirection =
        sortOrder === 'asc'
            ? 'ASC'
            : 'DESC';


    // =====================================================
    // DATA QUERY
    // =====================================================

    const dataQuery = `
        SELECT
            c.customer_id AS "customerId",
            c.customer_code AS "customerCode",
            c.display_name AS "displayName",
            c.gstin AS "gstin",

            CONCAT(
                c.primary_contact_first_name,
                CASE
                    WHEN c.primary_contact_last_name IS NOT NULL
                    AND c.primary_contact_last_name <> ''
                    THEN ' ' || c.primary_contact_last_name
                    ELSE ''
                END
            ) AS "primaryContact",

            c.email AS "email",
            c.primary_phone AS "phone",
            c.status AS "status",

            COALESCE(
                c.opening_balance,
                0
            ) AS "receivable",

            c.created_at AS "createdAt"

        FROM customer c

        ${whereConditions}

        ORDER BY
            ${orderColumn} ${orderDirection}

        LIMIT $${values.length + 1}
        OFFSET $${values.length + 2}
    `;


    const dataResult =
        await pool.query(
            dataQuery,
            [
                ...values,
                limit,
                offset
            ]
        );


    // =====================================================
    // COUNT QUERY
    // =====================================================

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM customer c
        ${whereConditions}
    `;


    const countResult =
        await pool.query(
            countQuery,
            values
        );


    return {

        rows: dataResult.rows,

        totalRecords:
            Number(countResult.rows[0].total)
    };
}
// =====================================================
// GET CUSTOMER BY ID
// =====================================================

async function getCustomerById(customerId) {

    const query = `
        SELECT

            c.customer_id AS "customerId",

            c.customer_code AS "customerCode",

            c.customer_type AS "customerType",

            c.primary_contact_prefix AS "primaryContactPrefix",

            c.primary_contact_first_name AS "primaryContactFirstName",

            c.primary_contact_last_name AS "primaryContactLastName",

            c.display_name AS "displayName",

            c.company_name AS "companyName",

            c.customer_language AS "customerLanguage",

            c.email AS "email",

            c.primary_phone AS "primaryPhone",

            c.secondary_phone AS "secondaryPhone",

            c.pan AS "pan",

            c.gstin AS "gstin",

            c.msme AS "msme",

            c.sales_region_id AS "salesRegionId",

            c.currency_code AS "currencyCode",

            c.opening_balance AS "openingBalance",

            c.payment_terms_id AS "paymentTermsId",

            c.status AS "status",

            c.created_at AS "createdAt",

            c.updated_at AS "updatedAt"

        FROM customer c

        WHERE c.customer_id = $1
    `;

    const result =
        await pool.query(
            query,
            [customerId]
        );

    return result.rows[0] || null;
}
// =====================================================
// GET CUSTOMER ADDRESSES
// =====================================================

async function getCustomerAddresses(customerId) {

    const query = `
        SELECT

            customer_address_id AS "customerAddressId",

            customer_id AS "customerId",

            address_type AS "addressType",

            attention,

            country,

            street_1 AS "street1",

            street_2 AS "street2",

            city,

            district,

            state,

            zip_code AS "zipCode",

            phone,

            fax

        FROM customer_addresses

        WHERE customer_id = $1

        ORDER BY customer_address_id
    `;

    const result =
        await pool.query(
            query,
            [customerId]
        );

    return result.rows;
}
// =====================================================
// GET CUSTOMER CONTACTS
// =====================================================

async function getCustomerContacts(customerId) {

    const query = `
        SELECT

            customer_contact_id AS "customerContactId",

            customer_id AS "customerId",

            contact_name AS "contactName",

            email_address AS "emailAddress",

            mobile_number AS "mobileNumber",

            designation,

            is_primary AS "isPrimary",

            created_at AS "createdAt"

        FROM customer_contacts

        WHERE customer_id = $1

        ORDER BY
            is_primary DESC,
            customer_contact_id
    `;

    const result =
        await pool.query(
            query,
            [customerId]
        );

    return result.rows;
}
// =====================================================
// GET CUSTOMER BANK DETAILS
// =====================================================
async function getCustomerBanks(customerId) {

    const query = `
        SELECT

            customer_bank_id AS "customerBankId",

            customer_id AS "customerId",

            bank_name AS "bankName",

            account_holder AS "accountHolder",

            account_number AS "accountNumber",

            ifsc_code AS "ifscCode",

            created_at AS "createdAt"

        FROM customer_bank_details

        WHERE customer_id = $1

        ORDER BY customer_bank_id
    `;

    const result =
        await pool.query(
            query,
            [customerId]
        );

    return result.rows;
}
// =====================================================
// GET CUSTOMER SUMMARY
// =====================================================

async function getCustomerSummary(customerId) {

    const query = `
        SELECT

            (
                SELECT COUNT(*)
                FROM sales_order so
                WHERE so.customer_id = $1
            ) AS "lifetimeOrders",

            (
                SELECT COALESCE(
                    SUM(i.total_amount),
                    0
                )
                FROM invoice i
                WHERE i.customer_id = $1
            ) AS "lifetimeValue",

            (
                SELECT COALESCE(
                    SUM(i.balance_amount),
                    0
                )
                FROM invoice i
                WHERE i.customer_id = $1
            ) AS "outstandingBalance"

    `;

    const result =
        await pool.query(
            query,
            [customerId]
        );

    return {
        lifetimeOrders:
            Number(result.rows[0].lifetimeOrders),

        lifetimeValue:
            Number(result.rows[0].lifetimeValue),

        outstandingBalance:
            Number(result.rows[0].outstandingBalance)
    };
}
// =====================================================
// GET CUSTOMER BOX SPECIFICATIONS
// =====================================================

async function getCustomerBoxSpecifications(customerId) {

    const query = `
        SELECT DISTINCT

            soi.box_spec AS "boxSpec",

            soi.box_description AS "boxDescription",

            soi.box_type AS "boxType",

            soi.paper_type AS "paperType",

            soi.box_size AS "boxSize",

            soi.ply AS "ply",

            soi.length AS "length",

            soi.width AS "width",

            soi.height AS "height",

            soi.print_type AS "printType",

            soi.joint_type AS "jointType",

            soi.top_paper_gsm AS "topPaperGsm",

            soi.liner_gsm AS "linerGsm",

            soi.flute_gsm AS "fluteGsm"

        FROM sales_order so

        INNER JOIN sales_order_item soi
            ON soi.sales_order_id = so.sales_order_id

        INNER JOIN customer c
            ON c.customer_id = so.customer_id

        WHERE c.customer_id = $1

        ORDER BY soi.box_spec
    `;

    const result =
        await pool.query(
            query,
            [customerId]
        );

    return result.rows;
}
// =====================================================
// GET CUSTOMER ORDER HISTORY
// =====================================================

async function getCustomerOrderHistory({
    customerId,
    page,
    limit,
    offset
}) {

    const dataQuery = `

        SELECT

            so.sales_order_id
                AS "salesOrderId",

            so.sales_order_number
                AS "orderNumber",

            so.sale_date
                AS "orderDate",

            soi.box_spec
                AS "boxSpec",

            soi.quantity
                AS "quantity",

            soi.item_total
                AS "value",

            so.delivery_status
                AS "deliveryStatus",

            i.payment_status
                AS "paymentStatus"

        FROM sales_order so

        INNER JOIN sales_order_item soi
            ON soi.sales_order_id =
               so.sales_order_id

        LEFT JOIN invoice i
            ON i.sales_order_id =
               so.sales_order_id

        WHERE so.customer_id = $1

        ORDER BY
            so.sale_date DESC,
            so.sales_order_id DESC

        LIMIT $2
        OFFSET $3
    `;


    const dataResult =
        await pool.query(
            dataQuery,
            [
                customerId,
                limit,
                offset
            ]
        );


    const countQuery = `

        SELECT COUNT(DISTINCT so.sales_order_id)

        FROM sales_order so

        WHERE so.customer_id = $1
    `;


    const countResult =
        await pool.query(
            countQuery,
            [customerId]
        );


    return {

        rows: dataResult.rows,

        totalRecords:
            Number(
                countResult.rows[0].count
            )
    };
}
// =====================================================
// GET CUSTOMER COMMERCIAL TERMS
// =====================================================
    async function getCustomerCommercialTerms(customerId) {

    const query = `
        SELECT

            c.credit_limit
                AS "creditLimit",

            c.payment_terms_id
                AS "creditPeriod",

            COALESCE(
                SUM(
                    CASE
                        WHEN UPPER(i.payment_status) <> 'PAID'
                        THEN i.balance_amount
                        ELSE 0
                    END
                ),
                0
            ) AS "outstandingBalance",

            COALESCE(
                SUM(i.total_amount),
                0
            ) AS "paymentTerms"

        FROM customer c

        LEFT JOIN invoice i
            ON i.customer_id = c.customer_id

        WHERE c.customer_id = $1

        GROUP BY
            c.customer_id,
            c.credit_limit,
            c.payment_terms_id
    `;

    const result =
        await pool.query(
            query,
            [customerId]
        );

    if (!result.rows[0]) {
        return null;
    }

    const row = result.rows[0];

    const creditLimit =
        Number(row.creditLimit || 0);

    const outstandingBalance =
        Number(row.outstandingBalance || 0);

    return {

        creditLimit,

        creditPeriod:
            row.creditPeriod,

        paymentTerms:
            Number(row.paymentTerms || 0),

        outstandingBalance,

        availableCredit:
            Math.max(
                creditLimit - outstandingBalance,
                0
            ),

        overdueStatus:
            outstandingBalance > 0
                ? 'Overdue'
                : 'No overdue'
    };
}
// =====================================================
// GET CUSTOMER PAYMENT ACTIVITY
// =====================================================

async function getCustomerPaymentActivity(customerId) {

    const query = `
        SELECT

            i.invoice_id
                AS "invoiceId",

            i.invoice_number
                AS "invoiceNumber",

            i.sales_order_id
                AS "salesOrderId",

            i.sales_order_number
                AS "salesOrderNumber",

            i.invoice_date
                AS "invoiceDate",

            i.due_date
                AS "dueDate",

            i.total_amount
                AS "totalAmount",

            i.amount_paid
                AS "amountPaid",

            i.balance_amount
                AS "balanceAmount",

            i.payment_status
                AS "paymentStatus"

        FROM invoice i

        WHERE i.customer_id = $1

        ORDER BY
            i.invoice_date DESC,
            i.invoice_id DESC

        LIMIT 10
    `;

    const result =
        await pool.query(
            query,
            [customerId]
        );

    return result.rows;
}
module.exports = {

    // Create
    createCustomer,
    createAddress,
    createContact,
    createBankDetails,

    // Validation / duplicate checks
    findCustomerByPan,
    findCustomerByGstin,

    // List
    getCustomers,

    // Customer details
    getCustomerById,
    getCustomerAddresses,
    getCustomerContacts,
    getCustomerBanks,
    getCustomerSummary,

    // Box specifications
    getCustomerBoxSpecifications,

    // Order history
    getCustomerOrderHistory,

    // Commercial terms / invoice
    getCustomerCommercialTerms,
    getCustomerPaymentActivity
};