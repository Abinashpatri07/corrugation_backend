const pool = require('../../config/database');


// =====================================================
// CREATE INVENTORY ITEM (master record)
// =====================================================

async function createInventoryItem(client, data) {

    const query = `
        INSERT INTO inventory_item (
            item_code,
            item_name,
            item_desc,
            category,
            unit,
            brand,
            front_view,
            rear_view,
            pur_price,
            pur_account,
            pur_desc,
            pur_vendor,
            selling_price,
            selling_account,
            selling_description,
            inventory_account,
            opening_stock,
            opening_stock_rate
        )
        VALUES (
            $1,  $2,  $3,  $4,  $5,
            $6,  $7,  $8,  $9,  $10,
            $11, $12, $13, $14, $15,
            $16, $17, $18
        )
        RETURNING
            inv_item_id AS "invItemId",
            item_code   AS "itemCode";
    `;

    const values = [
        data.itemCode,
        data.itemName,
        data.itemDesc           || null,
        data.category,
        data.unit               || null,
        data.brand              || null,
        data.frontView          || null,
        data.rearView           || null,
        data.purPrice           != null ? Number(data.purPrice)         : null,
        data.purAccount         || null,
        data.purDesc            || null,
        data.purVendor          != null ? Number(data.purVendor)        : null,
        data.sellingPrice       != null ? Number(data.sellingPrice)     : null,
        data.sellingAccount     || null,
        data.sellingDescription || null,
        data.inventoryAccount   || null,
        Number(data.openingStock     || 0),
        Number(data.openingStockRate || 0),
    ];

    const result = await client.query(query, values);

    return result.rows[0];
}


// =====================================================
// CREATE REEL SPECIFICATION
// =====================================================

async function createReelSpec(client, invItemId, spec) {

    const query = `
        INSERT INTO inventory_item_reel (
            inv_item_id,
            reel_type,
            reel_size,
            reel_gsm,
            reel_bf
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING inv_reel_id AS "invReelId";
    `;

    const result = await client.query(query, [
        invItemId,
        spec.reelType || null,
        spec.reelSize != null ? Number(spec.reelSize) : null,
        spec.reelGsm  != null ? Number(spec.reelGsm)  : null,
        spec.reelBf   != null ? Number(spec.reelBf)   : null,
    ]);

    return result.rows[0];
}


// =====================================================
// CREATE GLUE SPECIFICATION
// =====================================================

async function createGlueSpec(client, invItemId, spec) {

    const query = `
        INSERT INTO inventory_item_glue (
            inv_item_id,
            glue_tensile,
            glue_peel,
            glue_shear
        )
        VALUES ($1, $2, $3, $4)
        RETURNING inv_glue_id AS "invGlueId";
    `;

    const result = await client.query(query, [
        invItemId,
        spec.glueTensile != null ? Number(spec.glueTensile) : null,
        spec.gluePeel    != null ? Number(spec.gluePeel)    : null,
        spec.glueShear   != null ? Number(spec.glueShear)   : null,
    ]);

    return result.rows[0];
}


// =====================================================
// CREATE PAPER SPECIFICATION
// =====================================================

async function createPaperSpec(client, invItemId, spec) {

    const query = `
        INSERT INTO inventory_item_paper (
            inv_item_id,
            paper_gsm,
            paper_bf,
            paper_length,
            paper_width
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING inv_paper_id AS "invPaperId";
    `;

    const result = await client.query(query, [
        invItemId,
        spec.paperGsm    != null ? Number(spec.paperGsm)    : null,
        spec.paperBf     != null ? Number(spec.paperBf)     : null,
        spec.paperLength != null ? Number(spec.paperLength) : null,
        spec.paperWidth  != null ? Number(spec.paperWidth)  : null,
    ]);

    return result.rows[0];
}


// =====================================================
// CREATE 2-PLY SPECIFICATION
// =====================================================

async function createTwoPlySpec(client, invItemId, spec) {

    const query = `
        INSERT INTO inventory_item_two_ply (
            inv_item_id,
            ply_ply,
            ply_bf,
            ply_length,
            ply_width
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING inv_two_ply_id AS "invTwoPlyId";
    `;

    const result = await client.query(query, [
        invItemId,
        spec.plyPly    != null ? Number(spec.plyPly)    : null,
        spec.plyBf     != null ? Number(spec.plyBf)     : null,
        spec.plyLength != null ? Number(spec.plyLength) : null,
        spec.plyWidth  != null ? Number(spec.plyWidth)  : null,
    ]);

    return result.rows[0];
}


// =====================================================
// CREATE BOARD SPECIFICATION
// =====================================================

async function createBoardSpec(client, invItemId, spec) {

    const query = `
        INSERT INTO inventory_item_board (
            inv_item_id,
            board_ply,
            board_bf,
            board_length,
            board_width
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING inv_board_id AS "invBoardId";
    `;

    const result = await client.query(query, [
        invItemId,
        spec.boardPly    != null ? Number(spec.boardPly)    : null,
        spec.boardBf     != null ? Number(spec.boardBf)     : null,
        spec.boardLength != null ? Number(spec.boardLength) : null,
        spec.boardWidth  != null ? Number(spec.boardWidth)  : null,
    ]);

    return result.rows[0];
}


// =====================================================
// CREATE BOX SPECIFICATION
// =====================================================

async function createBoxSpec(client, invItemId, spec) {

    const query = `
        INSERT INTO inventory_item_box (
            inv_item_id,
            box_type,
            box_paper,
            box_ply,
            box_bf,
            box_length,
            box_width,
            box_height
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING inv_box_id AS "invBoxId";
    `;

    const result = await client.query(query, [
        invItemId,
        spec.boxType   || null,
        spec.boxPaper  || null,
        spec.boxPly    != null ? Number(spec.boxPly)    : null,
        spec.boxBf     != null ? Number(spec.boxBf)     : null,
        spec.boxLength != null ? Number(spec.boxLength) : null,
        spec.boxWidth  != null ? Number(spec.boxWidth)  : null,
        spec.boxHeight != null ? Number(spec.boxHeight) : null,
    ]);

    return result.rows[0];
}


// =====================================================
// CHECK DUPLICATE ITEM NAME
// =====================================================

async function findItemByName(client, itemName) {

    const result = await client.query(
        `
        SELECT inv_item_id, item_code
        FROM   inventory_item
        WHERE  LOWER(item_name) = LOWER($1)
        LIMIT  1
        `,
        [itemName]
    );

    return result.rows[0] || null;
}


// =====================================================
// GET INVENTORY ITEMS LIST
// =====================================================

async function getInventoryItems({
    limit,
    offset,
    search,
    category,
    sortBy,
    sortOrder,
}) {

    const values = [];

    let whereConditions = `WHERE 1 = 1`;


    // -------------------------------------------------
    // Search
    // -------------------------------------------------

    if (search) {
        values.push(`%${search}%`);
        whereConditions += `
            AND (
                i.item_name ILIKE $${values.length}
                OR i.item_code ILIKE $${values.length}
                OR i.brand     ILIKE $${values.length}
                OR i.category  ILIKE $${values.length}
            )
        `;
    }


    // -------------------------------------------------
    // Category filter
    // -------------------------------------------------

    if (category) {
        values.push(category);
        whereConditions += `
            AND LOWER(i.category) = LOWER($${values.length})
        `;
    }


    // -------------------------------------------------
    // Sort whitelist
    // -------------------------------------------------

    const sortColumnMap = {
        itemName:  'i.item_name',
        itemCode:  'i.item_code',
        category:  'i.category',
        brand:     'i.brand',
        createdAt: 'i.created_at',
    };

    const orderColumn =
        sortColumnMap[sortBy] || 'i.created_at';

    const orderDirection =
        sortOrder === 'asc' ? 'ASC' : 'DESC';


    // -------------------------------------------------
    // Data query
    // -------------------------------------------------

    const dataQuery = `
        SELECT
            i.inv_item_id        AS "invItemId",
            i.item_code          AS "itemCode",
            i.item_name          AS "itemName",
            i.category           AS "category",
            i.unit               AS "unit",
            i.brand              AS "brand",
            i.pur_price          AS "purPrice",
            i.selling_price      AS "sellingPrice",
            i.opening_stock      AS "openingStock",
            i.opening_stock_rate AS "openingStockRate",
            i.created_at         AS "createdAt"

        FROM inventory_item i

        ${whereConditions}

        ORDER BY ${orderColumn} ${orderDirection}

        LIMIT  $${values.length + 1}
        OFFSET $${values.length + 2}
    `;

    const dataResult = await pool.query(
        dataQuery,
        [...values, limit, offset]
    );


    // -------------------------------------------------
    // Count query
    // -------------------------------------------------

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM   inventory_item i
        ${whereConditions}
    `;

    const countResult = await pool.query(
        countQuery,
        values
    );


    return {
        rows:         dataResult.rows,
        totalRecords: Number(countResult.rows[0].total),
    };
}


// =====================================================
// GET INVENTORY ITEM BY ID (master + spec)
// =====================================================

async function getInventoryItemById(invItemId) {

    const result = await pool.query(
        `
        SELECT
            inv_item_id          AS "invItemId",
            item_code            AS "itemCode",
            item_name            AS "itemName",
            item_desc            AS "itemDesc",
            category             AS "category",
            unit                 AS "unit",
            brand                AS "brand",
            front_view           AS "frontView",
            rear_view            AS "rearView",
            pur_price            AS "purPrice",
            pur_account          AS "purAccount",
            pur_desc             AS "purDesc",
            pur_vendor           AS "purVendor",
            selling_price        AS "sellingPrice",
            selling_account      AS "sellingAccount",
            selling_description  AS "sellingDescription",
            inventory_account    AS "inventoryAccount",
            opening_stock        AS "openingStock",
            opening_stock_rate   AS "openingStockRate",
            created_at           AS "createdAt",
            modified_at          AS "modifiedAt"

        FROM inventory_item
        WHERE inv_item_id = $1
        `,
        [invItemId]
    );

    return result.rows[0] || null;
}


// =====================================================
// GET CATEGORY-SPECIFIC SPEC BY ITEM ID
// =====================================================

async function getReelSpec(invItemId) {
    const r = await pool.query(
        `SELECT inv_reel_id AS "invReelId", reel_type AS "reelType",
                reel_size AS "reelSize", reel_gsm AS "reelGsm",
                reel_bf AS "reelBf"
         FROM inventory_item_reel WHERE inv_item_id = $1 LIMIT 1`,
        [invItemId]
    );
    return r.rows[0] || null;
}

async function getGlueSpec(invItemId) {
    const r = await pool.query(
        `SELECT inv_glue_id AS "invGlueId", glue_tensile AS "glueTensile",
                glue_peel AS "gluePeel", glue_shear AS "glueShear"
         FROM inventory_item_glue WHERE inv_item_id = $1 LIMIT 1`,
        [invItemId]
    );
    return r.rows[0] || null;
}

async function getPaperSpec(invItemId) {
    const r = await pool.query(
        `SELECT inv_paper_id AS "invPaperId", paper_gsm AS "paperGsm",
                paper_bf AS "paperBf", paper_length AS "paperLength",
                paper_width AS "paperWidth"
         FROM inventory_item_paper WHERE inv_item_id = $1 LIMIT 1`,
        [invItemId]
    );
    return r.rows[0] || null;
}

async function getTwoPlySpec(invItemId) {
    const r = await pool.query(
        `SELECT inv_two_ply_id AS "invTwoPlyId", ply_ply AS "plyPly",
                ply_bf AS "plyBf", ply_length AS "plyLength",
                ply_width AS "plyWidth"
         FROM inventory_item_two_ply WHERE inv_item_id = $1 LIMIT 1`,
        [invItemId]
    );
    return r.rows[0] || null;
}

async function getBoardSpec(invItemId) {
    const r = await pool.query(
        `SELECT inv_board_id AS "invBoardId", board_ply AS "boardPly",
                board_bf AS "boardBf", board_length AS "boardLength",
                board_width AS "boardWidth"
         FROM inventory_item_board WHERE inv_item_id = $1 LIMIT 1`,
        [invItemId]
    );
    return r.rows[0] || null;
}

async function getBoxSpec(invItemId) {
    const r = await pool.query(
        `SELECT inv_box_id AS "invBoxId", box_type AS "boxType",
                box_paper AS "boxPaper", box_ply AS "boxPly",
                box_bf AS "boxBf", box_length AS "boxLength",
                box_width AS "boxWidth", box_height AS "boxHeight"
         FROM inventory_item_box WHERE inv_item_id = $1 LIMIT 1`,
        [invItemId]
    );
    return r.rows[0] || null;
}


// =====================================================
// INVENTORY CONTROL (ADJUSTMENT)
// =====================================================

async function createInventoryAdjustment(client, data) {
    const query = `
        INSERT INTO inventory_adjustment (
            adjustment_number,
            adjustment_mode,
            reference_number,
            adjustment_date,
            account_id,
            reason,
            description,
            status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING adjustment_id AS "adjId";
    `;

    const adjNumber = data.adjustment_number || `ADJ-${Date.now()}`;

    const values = [
        adjNumber,
        data.adjustment_mode,
        data.reference_number || null,
        data.adjustment_date ? new Date(data.adjustment_date) : new Date(),
        data.account_id || null,
        data.reason,
        data.description || null,
        data.status || 'DRAFT'
    ];

    const result = await client.query(query, values);
    return result.rows[0];
}

async function createInventoryAdjustmentItem(client, adjId, item) {
    const query = `
        INSERT INTO inventory_adjustment_item (
            adjustment_id,
            inv_item_id,
            plant_id,
            quantity_available,
            new_quantity_on_hand,
            quantity_adjusted,
            previous_value,
            new_value,
            value_adjusted,
            unit_rate,
            remarks
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING adjustment_item_id AS "adjItemId";
    `;

    const values = [
        adjId,
        Number(item.inv_item_id),
        item.plant_id || null,
        Number(item.quantity_available || 0),
        Number(item.new_quantity_on_hand || 0),
        Number(item.quantity_adjusted || 0),
        Number(item.previous_value || 0),
        Number(item.new_value || 0),
        Number(item.value_adjusted || 0),
        item.unit_rate != null ? Number(item.unit_rate) : null,
        item.remarks || null
    ];

    const result = await client.query(query, values);
    return result.rows[0];
}

async function updateInventoryItemStock(client, invItemId, newStock) {
    const query = `
        UPDATE inventory_item
        SET opening_stock = $1
        WHERE inv_item_id = $2
        RETURNING opening_stock AS "openingStock";
    `;

    const result = await client.query(query, [Number(newStock), Number(invItemId)]);
    return result.rows[0] || null;
}

async function getInventoryControls({ limit, offset, search }) {
    const values = [];
    let whereConditions = `WHERE 1 = 1`;

    if (search) {
        values.push(`%${search}%`);
        whereConditions += `
            AND (
                a.adjustment_number ILIKE $${values.length}
                OR a.reference_number ILIKE $${values.length}
                OR a.reason ILIKE $${values.length}
            )
        `;
    }

    const dataQuery = `
        SELECT
            a.adjustment_id AS "id",
            a.adjustment_number AS "referenceNumber",
            a.adjustment_mode AS "type",
            a.reference_number AS "customReference",
            a.adjustment_date AS "date",
            a.reason AS "reason",
            a.description AS "description",
            a.status AS "status",
            a.created_at AS "createdAt",
            a.modified_at AS "modifiedAt"
        FROM inventory_adjustment a
        ${whereConditions}
        ORDER BY a.created_at DESC
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const dataResult = await pool.query(dataQuery, [...values, limit, offset]);

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM inventory_adjustment a
        ${whereConditions}
    `;
    const countResult = await pool.query(countQuery, values);

    return {
        rows: dataResult.rows,
        totalRecords: Number(countResult.rows[0].total),
    };
}

async function getInventoryControlDetails(adjId) {
    const masterQuery = `
        SELECT
            adjustment_id AS "id",
            adjustment_number AS "referenceNumber",
            adjustment_mode AS "type",
            reference_number AS "customReference",
            adjustment_date AS "date",
            reason AS "reason",
            description AS "description",
            status AS "status",
            created_at AS "createdAt",
            modified_at AS "modifiedAt"
        FROM inventory_adjustment
        WHERE adjustment_id = $1
    `;
    
    const itemsQuery = `
        SELECT
            ai.adjustment_item_id AS "itemId",
            ai.inv_item_id AS "invItemId",
            i.item_code AS "itemCode",
            i.item_name AS "itemName",
            i.pur_price AS "costPrice",
            ai.quantity_available AS "quantityAvailable",
            ai.new_quantity_on_hand AS "newQuantityOnHand",
            ai.quantity_adjusted AS "quantityAdjusted",
            ai.previous_value AS "previousValue",
            ai.new_value AS "newValue",
            ai.value_adjusted AS "valueAdjusted"
        FROM inventory_adjustment_item ai
        JOIN inventory_item i ON ai.inv_item_id = i.inv_item_id
        WHERE ai.adjustment_id = $1
    `;
    
    const masterResult = await pool.query(masterQuery, [adjId]);
    if (masterResult.rows.length === 0) return null;
    
    const itemsResult = await pool.query(itemsQuery, [adjId]);
    
    return {
        ...masterResult.rows[0],
        items: itemsResult.rows,
    };
}

module.exports = {
    createInventoryItem,
    createReelSpec,
    createGlueSpec,
    createPaperSpec,
    createTwoPlySpec,
    createBoardSpec,
    createBoxSpec,
    findItemByName,
    getInventoryItems,
    getInventoryItemById,
    getReelSpec,
    getGlueSpec,
    getPaperSpec,
    getTwoPlySpec,
    getBoardSpec,
    getBoxSpec,
    createInventoryAdjustment,
    createInventoryAdjustmentItem,
    updateInventoryItemStock,
    getInventoryControls,
    getInventoryControlDetails,
};
