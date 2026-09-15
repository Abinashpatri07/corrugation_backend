const pool = require('../../config/database');


// =====================================================
// CREATE VENDOR
// =====================================================

async function createVendor(client, data) {

    const query = `
        INSERT INTO vendor (
            vendor_code,
            vendor_type,
            primary_salutation,
            primary_first_name,
            primary_last_name,
            display_name,
            company_name,
            vendor_language,
            email,
            primary_number,
            secondary_number,
            pan,
            gstin,
            msme,
            currency,
            opening_balance,
            accounts_payable,
            payment_terms,
            advance_required,
            status
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20
        )
        RETURNING
            vendor_id AS "vendorId",
            vendor_code AS "vendorCode";
    `;

    const values = [
        data.vendorCode,
        data.vendorType || 'Regular',
        data.primaryContactPrefix || null,
        data.primaryContactFirstName,
        data.primaryContactLastName || null,
        data.displayName,
        data.companyName,
        data.vendorLanguage || 'English',
        data.emailAddress,
        data.primaryNumber,
        data.secondaryNumber || null,
        data.pan,
        data.gstin || null,
        data.msme,
        data.currencyCode || 'INR',
        Number(data.openingBalance || 0),
        Number(data.accountsPayable || 0),
        data.paymentTermsId || 'Net 30',
        data.advanceRequired || 'None',
        data.status || 'ACTIVE'
    ];

    const result =
        await client.query(
            query,
            values
        );

    return result.rows[0];
}


// =====================================================
// CREATE VENDOR ADDRESS
// =====================================================
//
// Maps the Customer-style frontend address fields to the
// actual Vendor Address database columns.
// =====================================================

async function createAddress(
    client,
    vendorId,
    address
) {

    const query = `
        INSERT INTO vendor_address (
            vendor_id,
            address_type,
            address_line1,
            address_line2,
            city,
            state,
            country,
            pincode,
            phone,
            fax,
            contact_name
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10, $11
        )
        RETURNING address_id;
    `;

    const values = [
        vendorId,
        address.addressType,
        address.street1 || '',
        address.street2 || null,
        address.city || '',
        address.state || '',
        address.country || 'India',
        address.zipCode || '',
        address.phone || null,
        address.fax || null,
        address.attention || null
    ];

    const result =
        await client.query(
            query,
            values
        );

    return result.rows[0];
}


// =====================================================
// CREATE VENDOR CONTACT
// =====================================================

async function createContact(
    client,
    vendorId,
    contact
) {

    const query = `
        INSERT INTO vendor_contact (
            vendor_id,
            salutation,
            first_name,
            last_name,
            designation,
            phone,
            email,
            is_primary
        )
        VALUES (
            $1, $2, $3, $4,
            $5, $6, $7, $8
        )
        RETURNING contact_id;
    `;

    // The current CreateVendorPage uses one combined name.
    // Split it into first_name and last_name because the
    // Vendor schema stores them separately.
    const nameParts =
        String(contact.name || '')
            .trim()
            .split(/\s+/);

    const firstName =
        nameParts.shift() || '';

    const lastName =
        nameParts.join(' ') || null;

    const values = [
        vendorId,
        contact.salutation || null,
        firstName,
        lastName,
        contact.designation || null,
        contact.mobileNumber || '',
        contact.emailAddress || null,
        contact.isPrimary || false
    ];

    const result =
        await client.query(
            query,
            values
        );

    return result.rows[0];
}


// =====================================================
// CREATE VENDOR BANK DETAILS
// =====================================================

async function createBankDetails(
    client,
    vendorId,
    bank
) {

    const query = `
        INSERT INTO vendor_bank (
            vendor_id,
            bank_name,
            account_holder_name,
            account_number,
            ifsc_code,
            open_date,
            is_primary
        )
        VALUES (
            $1, $2, $3, $4,
            $5, $6, $7
        )
        RETURNING bank_id;
    `;

    const values = [
        vendorId,
        bank.bankName || '',
        bank.accountHolder || '',
        bank.accountNumber || '',
        bank.ifscCode || '',
        bank.openDate || null,
        bank.isPrimary || false
    ];

    const result =
        await client.query(
            query,
            values
        );

    return result.rows[0];
}


// =====================================================
// DUPLICATE PAN CHECK
// =====================================================

async function findVendorByPan(
    client,
    pan
) {

    const result =
        await client.query(
            `
            SELECT
                vendor_id,
                vendor_code
            FROM vendor
            WHERE UPPER(pan) = UPPER($1)
            LIMIT 1
            `,
            [pan]
        );

    return result.rows[0];
}


// =====================================================
// DUPLICATE GSTIN CHECK
// =====================================================

async function findVendorByGstin(
    client,
    gstin
) {

    if (!gstin) {
        return null;
    }

    const result =
        await client.query(
            `
            SELECT
                vendor_id,
                vendor_code
            FROM vendor
            WHERE UPPER(gstin) = UPPER($1)
            LIMIT 1
            `,
            [gstin]
        );

    return result.rows[0];
}


// =====================================================
// GET VENDOR LIST
// =====================================================

async function getVendors({
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


    // -------------------------------------------------
    // Search
    // -------------------------------------------------

    if (search) {

        values.push(`%${search}%`);

        whereConditions += `
            AND (
                v.display_name ILIKE $${values.length}
                OR v.company_name ILIKE $${values.length}
                OR v.vendor_code ILIKE $${values.length}
                OR v.gstin ILIKE $${values.length}
                OR v.email ILIKE $${values.length}
                OR v.primary_number ILIKE $${values.length}
                OR CONCAT(
                    v.primary_first_name,
                    ' ',
                    v.primary_last_name
                ) ILIKE $${values.length}
            )
        `;
    }


    // -------------------------------------------------
    // Status
    // -------------------------------------------------

    if (status) {

        values.push(status);

        whereConditions += `
            AND UPPER(v.status) = UPPER($${values.length})
        `;
    }


    // -------------------------------------------------
    // Sort whitelist
    // -------------------------------------------------

    const sortColumnMap = {
        displayName: 'v.display_name',
        companyName: 'v.company_name',
        vendorCode: 'v.vendor_code',
        gstin: 'v.gstin',
        email: 'v.email',
        phone: 'v.primary_number',
        status: 'v.status',
        createdAt: 'v.created_at'
    };

    const orderColumn =
        sortColumnMap[sortBy] ||
        'v.created_at';

    const orderDirection =
        sortOrder === 'asc'
            ? 'ASC'
            : 'DESC';


    // -------------------------------------------------
    // Data query
    // -------------------------------------------------

    const dataQuery = `
        SELECT
            v.vendor_id AS "vendorId",
            v.vendor_code AS "vendorCode",
            v.display_name AS "displayName",
            v.company_name AS "companyName",
            v.gstin AS "gstin",

            CONCAT(
                v.primary_first_name,
                CASE
                    WHEN v.primary_last_name IS NOT NULL
                    AND v.primary_last_name <> ''
                    THEN ' ' || v.primary_last_name
                    ELSE ''
                END
            ) AS "primaryContact",

            v.email AS "email",
            v.primary_number AS "phone",
            v.status AS "status",

            COALESCE(
                v.accounts_payable,
                0
            ) AS "payable",

            v.created_at AS "createdAt"

        FROM vendor v

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


    // -------------------------------------------------
    // Count query
    // -------------------------------------------------

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM vendor v
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
            Number(
                countResult.rows[0].total
            )
    };
}


// =====================================================
// GET VENDOR BY ID
// =====================================================

async function getVendorById(vendorId) {

    const query = `
        SELECT
            v.vendor_id AS "vendorId",
            v.vendor_code AS "vendorCode",
            v.vendor_type AS "vendorType",

            v.primary_salutation
                AS "primaryContactPrefix",

            v.primary_first_name
                AS "primaryContactFirstName",

            v.primary_last_name
                AS "primaryContactLastName",

            v.display_name AS "displayName",
            v.company_name AS "companyName",
            v.vendor_language AS "vendorLanguage",

            v.email AS "email",

            v.primary_number
                AS "primaryPhone",

            v.secondary_number
                AS "secondaryPhone",

            v.pan AS "pan",
            v.gstin AS "gstin",
            v.msme AS "msme",
            v.currency AS "currencyCode",

            v.opening_balance
                AS "openingBalance",

            v.accounts_payable
                AS "accountsPayable",

            v.payment_terms
                AS "paymentTerms",

            v.advance_required
                AS "advanceRequired",

            v.status AS "status",

            v.created_at AS "createdAt",
            v.updated_at AS "updatedAt"

        FROM vendor v

        WHERE v.vendor_id = $1
    `;

    const result =
        await pool.query(
            query,
            [vendorId]
        );

    return result.rows[0] || null;
}


// =====================================================
// GET VENDOR ADDRESSES
// =====================================================

async function getVendorAddresses(vendorId) {

    const query = `
        SELECT
            address_id AS "addressId",
            vendor_id AS "vendorId",

            address_type
                AS "addressType",

            contact_name
                AS "attention",

            country,

            address_line1
                AS "street1",

            address_line2
                AS "street2",

            city,
            state,

            pincode
                AS "zipCode",

            phone,
            fax,

            created_at
                AS "createdAt"

        FROM vendor_address

        WHERE vendor_id = $1

        ORDER BY
            address_id
    `;

    const result =
        await pool.query(
            query,
            [vendorId]
        );

    return result.rows;
}


// =====================================================
// GET VENDOR CONTACTS
// =====================================================

async function getVendorContacts(vendorId) {

    const query = `
        SELECT
            contact_id AS "contactId",
            vendor_id AS "vendorId",

            salutation,

            first_name
                AS "firstName",

            last_name
                AS "lastName",

            designation,
            department,

            phone
                AS "mobileNumber",

            email
                AS "emailAddress",

            is_primary
                AS "isPrimary",

            created_at
                AS "createdAt"

        FROM vendor_contact

        WHERE vendor_id = $1

        ORDER BY
            is_primary DESC,
            contact_id
    `;

    const result =
        await pool.query(
            query,
            [vendorId]
        );

    return result.rows;
}


// =====================================================
// GET VENDOR BANK DETAILS
// =====================================================

async function getVendorBanks(vendorId) {

    const query = `
        SELECT
            bank_id AS "bankId",
            vendor_id AS "vendorId",

            bank_name
                AS "bankName",

            account_holder_name
                AS "accountHolder",

            account_number
                AS "accountNumber",

            ifsc_code
                AS "ifscCode",

            open_date
                AS "openDate",

            is_primary
                AS "isPrimary",

            created_at
                AS "createdAt"

        FROM vendor_bank

        WHERE vendor_id = $1

        ORDER BY
            is_primary DESC,
            bank_id
    `;

    const result =
        await pool.query(
            query,
            [vendorId]
        );

    return result.rows;
}


// =====================================================
// GET VENDOR DOCUMENTS
// =====================================================
//
// NOTE:
// This assumes vendor_document contains the following
// columns:
// document_id, vendor_id, document_type,
// document_number, document_url, created_at.
//
// Verify this table schema if the Documents section
// produces a database-column error.
// =====================================================

async function getVendorDocuments(vendorId) {

    const query = `
        SELECT
            document_id AS "documentId",
            vendor_id AS "vendorId",

            document_type
                AS "documentType",

            document_number
                AS "documentNumber",

            document_url
                AS "documentUrl",

            created_at
                AS "createdAt"

        FROM vendor_document

        WHERE vendor_id = $1

        ORDER BY
            document_id DESC
    `;

    const result =
        await pool.query(
            query,
            [vendorId]
        );

    return result.rows;
}


// =====================================================
// GET VENDOR SUMMARY
// =====================================================
//
// Summary values are derived only from columns that exist
// in the supplied Purchase Order and Vendor schemas.
//
// lifetimeOrders
//     = number of Purchase Orders for this Vendor
//
// lifetimeValue
//     = SUM(purchase_order.estimated_total)
//
// outstandingBalance
//     = vendor.accounts_payable
//
// activeOrders
//     = Purchase Orders not Delivered/Closed/Cancelled
//
// onTimeDeliveryPercentage
//     = percentage of completed POs delivered on or
//       before expected_delivery_date
// =====================================================

async function getVendorSummary(vendorId) {

    const query = `
        SELECT

            (
                SELECT COUNT(*)

                FROM purchase_order po

                WHERE po.vendor_id = $1

            ) AS "lifetimeOrders",


            (
                SELECT COALESCE(
                    SUM(po.estimated_total),
                    0
                )

                FROM purchase_order po

                WHERE po.vendor_id = $1

            ) AS "lifetimeValue",


            (
                SELECT COALESCE(
                    v.accounts_payable,
                    0
                )

                FROM vendor v

                WHERE v.vendor_id = $1

            ) AS "outstandingBalance",


            (
                SELECT COUNT(*)

                FROM purchase_order po

                WHERE po.vendor_id = $1

                AND UPPER(
                    COALESCE(
                        po.delivery_status,
                        ''
                    )
                ) NOT IN (
                    'DELIVERED',
                    'CLOSED',
                    'CANCELLED'
                )

            ) AS "activeOrders",


            (
                SELECT COALESCE(

                    AVG(
                        CASE

                            WHEN
                                po.actual_delivery_date IS NULL
                                OR
                                po.expected_delivery_date IS NULL

                            THEN NULL


                            WHEN
                                po.actual_delivery_date
                                <=
                                po.expected_delivery_date

                            THEN 100


                            ELSE 0

                        END
                    ),

                    0

                )

                FROM purchase_order po

                WHERE po.vendor_id = $1

            ) AS "onTimeDeliveryPercentage"
    `;

    const result =
        await pool.query(
            query,
            [vendorId]
        );

    const row =
        result.rows[0];

    return {

        lifetimeOrders:
            Number(
                row.lifetimeOrders || 0
            ),

        lifetimeValue:
            Number(
                row.lifetimeValue || 0
            ),

        outstandingBalance:
            Number(
                row.outstandingBalance || 0
            ),

        activeOrders:
            Number(
                row.activeOrders || 0
            ),

        onTimeDeliveryPercentage:
            Number(
                row.onTimeDeliveryPercentage || 0
            )
    };
}

// =====================================================
// GET VENDOR REEL SPECIFICATIONS
// =====================================================
//
// IMPORTANT:
// reel_specification does NOT contain vendor_id.
//
// Therefore Vendor -> Reel Specifications is resolved as:
//
// vendor
//    ↓
// purchase_order
//    ↓
// purchase_order_item
//    ↓
// reel_specification
//
// This prevents the previous invalid query:
//
// reel_specification.vendor_id
//
// from being used.
// =====================================================

async function getVendorReelSpecifications(
    vendorId,
    search = ''
) {

    const values = [
        vendorId
    ];

    let whereConditions = `
        WHERE po.vendor_id = $1
    `;


    // -------------------------------------------------
    // Search
    // -------------------------------------------------

    if (search && search.trim()) {

        values.push(
            `%${search.trim()}%`
        );

        whereConditions += `
            AND (
                poi.reel_spec ILIKE $2
                OR poi.reel_description ILIKE $2
                OR poi.paper_type ILIKE $2
            )
        `;
    }


    // -------------------------------------------------
    // Query
    // -------------------------------------------------

    const query = `
        SELECT DISTINCT

            poi.reel_id
                AS "reelId",

            rs.reel_code
                AS "reelCode",

            poi.reel_spec
                AS "reelSpec",

            poi.reel_description
                AS "reelDescription",

            poi.paper_type
                AS "paperType",

            poi.paper_gsm
                AS "paperGsm",

            poi.reel_width
                AS "reelWidth",

            poi.reel_bf
                AS "reelBf"

        FROM purchase_order po

        INNER JOIN purchase_order_item poi

            ON poi.purchase_order_id =
               po.purchase_order_id

        LEFT JOIN reel_specification rs

            ON rs.reel_id =
               poi.reel_id

        ${whereConditions}

        ORDER BY
            poi.reel_spec,
            poi.reel_id
    `;

    const result =
        await pool.query(
            query,
            values
        );

    return result.rows;
}


// =====================================================
// GET VENDOR PURCHASE ORDER HISTORY
// =====================================================
//
// One row is returned per Purchase Order Item.
//
// Actual Purchase Order columns:
//
// purchase_order_id
// purchase_order_number
// pr_id
// pr_number
// vendor_id
// po_date
// expected_delivery_date
// actual_delivery_date
// delivery_status
// item_count
// item_total
// estimated_total
//
// Actual Purchase Order Item columns:
//
// po_item_id
// purchase_order_id
// reel_id
// reel_spec
// reel_description
// paper_type
// paper_gsm
// reel_width
// reel_bf
// quantity
// unit_rate
// total_amount
//
// There is NO:
// po_number
// material_description
// unit
// value
// qc_status
// purchase_order_item_id
//
// Therefore aliases are used where the frontend expects
// those conceptual values.
// =====================================================

async function getVendorPurchaseOrderHistory({
    vendorId,
    page,
    limit,
    offset,
    search,
    startDate,
    endDate
}) {

    const values = [
        vendorId
    ];

    let whereConditions = `
        WHERE po.vendor_id = $1
    `;


    // -------------------------------------------------
    // Search
    // -------------------------------------------------

    if (search && search.trim()) {

        values.push(
            `%${search.trim()}%`
        );

        whereConditions += `
            AND (
                po.purchase_order_number ILIKE $2
                OR poi.reel_spec ILIKE $2
                OR poi.reel_description ILIKE $2
                OR poi.paper_type ILIKE $2
            )
        `;
    }


    // -------------------------------------------------
    // Start Date
    // -------------------------------------------------

    if (startDate) {

        values.push(startDate);

        whereConditions += `
            AND po.po_date >= $${values.length}
        `;
    }


    // -------------------------------------------------
    // End Date
    // -------------------------------------------------

    if (endDate) {

        values.push(endDate);

        whereConditions += `
            AND po.po_date <= $${values.length}
        `;
    }


    // -------------------------------------------------
    // Data query values
    // -------------------------------------------------

    const dataValues = [
        ...values,
        limit,
        offset
    ];


    // -------------------------------------------------
    // Data query
    // -------------------------------------------------

    const dataQuery = `
        SELECT

            po.purchase_order_id
                AS "purchaseOrderId",

            po.purchase_order_number
                AS "poNumber",

            po.purchase_order_number
                AS "orderNumber",

            po.po_date
                AS "poDate",

            poi.po_item_id
                AS "poItemId",

            poi.reel_id
                AS "reelId",

            poi.reel_spec
                AS "reelSpec",

            poi.reel_description
                AS "materialDescription",

            poi.reel_description
                AS "reelDescription",

            poi.paper_type
                AS "paperType",

            poi.paper_gsm
                AS "paperGsm",

            poi.reel_width
                AS "reelWidth",

            poi.reel_bf
                AS "reelBf",

            poi.quantity
                AS "quantity",

            poi.unit_rate
                AS "unitRate",

            poi.total_amount
                AS "totalAmount",

            poi.total_amount
                AS "value",

            po.item_count
                AS "itemCount",

            po.item_total
                AS "itemTotal",

            po.estimated_total
                AS "estimatedTotal",

            po.expected_delivery_date
                AS "expectedDeliveryDate",

            po.actual_delivery_date
                AS "actualDeliveryDate",

            po.delivery_status
                AS "deliveryStatus"

        FROM purchase_order po

        INNER JOIN purchase_order_item poi

            ON poi.purchase_order_id =
               po.purchase_order_id

        ${whereConditions}

        ORDER BY
            po.po_date DESC,
            po.purchase_order_id DESC,
            poi.po_item_id DESC

        LIMIT $${values.length + 1}

        OFFSET $${values.length + 2}
    `;

    const dataResult =
        await pool.query(
            dataQuery,
            dataValues
        );


    // -------------------------------------------------
    // Count query
    // -------------------------------------------------

    const countQuery = `
        SELECT COUNT(*) AS total

        FROM purchase_order po

        INNER JOIN purchase_order_item poi

            ON poi.purchase_order_id =
               po.purchase_order_id

        ${whereConditions}
    `;

    const countResult =
        await pool.query(
            countQuery,
            values
        );


    return {

        rows:
            dataResult.rows,

        totalRecords:
            Number(
                countResult.rows[0].total
            )
    };
}


// =====================================================
// GET VENDOR COMMERCIAL TERMS
// =====================================================
//
// Actual Bill schema contains:
//
// bill_id
// bill_number
// purchase_order_id
// vendor_id
// vendor_code
// bill_date
// due_date
// delivery_status
// grn_status
// item_count
// item_total
// gst_rate
// gst_amount
// discount_rate
// discount_amount
// total_amount
//
// There is NO bill.status.
//
// There is also NO bill_item.amount.
// The correct Bill Item column is total_amount.
//
// Since the current schema does not contain paid amount or
// payment status, outstanding balance is taken from
// vendor.accounts_payable.
// =====================================================

async function getVendorCommercialTerms(vendorId) {

    const query = `
        SELECT

            v.currency
                AS "currencyCode",

            v.opening_balance
                AS "openingBalance",

            v.accounts_payable
                AS "accountsPayable",

            v.payment_terms
                AS "paymentTerms",

            v.advance_required
                AS "advanceRequired",

            COALESCE(
                v.accounts_payable,
                0
            ) AS "outstandingBalance",

            COALESCE(

                (
                    SELECT
                        SUM(
                            b.total_amount
                        )

                    FROM bill b

                    WHERE b.vendor_id =
                          v.vendor_id
                ),

                0

            ) AS "totalBilledAmount"

        FROM vendor v

        WHERE v.vendor_id = $1
    `;


    const result =
        await pool.query(
            query,
            [vendorId]
        );


    if (!result.rows[0]) {
        return null;
    }


    const row =
        result.rows[0];


    return {

        currencyCode:
            row.currencyCode,


        openingBalance:
            Number(
                row.openingBalance || 0
            ),


        accountsPayable:
            Number(
                row.accountsPayable || 0
            ),


        paymentTerms:
            row.paymentTerms,


        advanceRequired:
            row.advanceRequired,


        outstandingBalance:
            Number(
                row.outstandingBalance || 0
            ),


        totalBilledAmount:
            Number(
                row.totalBilledAmount || 0
            )
    };
}


// =====================================================
// MODULE EXPORTS
// =====================================================

module.exports = {

    // Create
    createVendor,
    createAddress,
    createContact,
    createBankDetails,

    // Duplicate checks
    findVendorByPan,
    findVendorByGstin,

    // Vendor list
    getVendors,

    // Vendor details
    getVendorById,
    getVendorAddresses,
    getVendorContacts,
    getVendorBanks,
    getVendorDocuments,

    // Vendor dashboard
    getVendorSummary,

    // Vendor-specific tabs
    getVendorReelSpecifications,
    getVendorPurchaseOrderHistory,
    getVendorCommercialTerms
};
