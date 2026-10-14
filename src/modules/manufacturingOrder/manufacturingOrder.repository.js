const dbModule = require("../../config/database");
const pool = dbModule.pool || dbModule;

// Get all manufacturing orders for the left sidebar.
const getAll = async ({
    search = "",
    status = "",
    limit = 100,
    offset = 0,
} = {}) => {
    const values = [];
    const conditions = [];

    if (search) {
        values.push(`%${search}%`);
        const p = `$${values.length}`;

        conditions.push(`(
      mo.manufacturing_order_number ILIKE ${p}
      OR COALESCE(mo.sales_order_number, '') ILIKE ${p}
      OR COALESCE(mo.customer_code, '') ILIKE ${p}
    )`);
    }

    if (status) {
        values.push(status.toUpperCase());
        conditions.push(`mo.status = $${values.length}`);
    }

    values.push(Math.min(Math.max(Number(limit) || 100, 1), 500));
    const limitParam = `$${values.length}`;

    values.push(Math.max(Number(offset) || 0, 0));
    const offsetParam = `$${values.length}`;

    const where = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const result = await pool.query(
        `SELECT mo.*
       FROM public.manufacturing_order mo
       ${where}
      ORDER BY mo.created_at DESC,
               mo.manufacturing_order_id DESC
      LIMIT ${limitParam} OFFSET ${offsetParam}`,
        values
    );

    const orders = result.rows;

    for (const order of orders) {
        order.customer = await getCustomerById(order.customer_id);

        order.sales_order = await getSalesOrderById(
            order.sales_order_id
        );

        order.items = await getItems(
            order.manufacturing_order_id
        );

        const summary = await pool.query(
            `SELECT
          COUNT(*)::int AS item_count,
          COALESCE(SUM(quantity), 0) AS total_quantity,
          COALESCE(SUM(total_amount), 0) AS total_amount
       FROM public.manufacturing_order_item
       WHERE manufacturing_order_id = $1`,
            [order.manufacturing_order_id]
        );

        order.item_summary = summary.rows[0];
    }

    return orders;
};

// Retrieve one manufacturing order by numeric ID or MO number.
const getById = async (id) => {
    const isNumericId = /^\d+$/.test(String(id));

    const result = isNumericId
        ? await pool.query(
            `SELECT *
           FROM public.manufacturing_order
          WHERE manufacturing_order_id = $1
          LIMIT 1`,
            [id]
        )
        : await pool.query(
            `SELECT *
           FROM public.manufacturing_order
          WHERE manufacturing_order_number = $1
          LIMIT 1`,
            [id]
        );

    return result.rows[0] || null;
};

// Customer schema is not fully available, so retrieve the existing row.
const getCustomerById = async (customerId, client = pool) => {
    if (!customerId) return null;

    const result = await client.query(
        `SELECT *
       FROM public.customer
      WHERE customer_id = $1
      LIMIT 1`,
        [customerId]
    );

    return result.rows[0] || null;
};

const getSalesOrderById = async (salesOrderId, client = pool) => {
    if (!salesOrderId) return null;

    const result = await client.query(
        `SELECT *
       FROM public.sales_order
      WHERE sales_order_id = $1
      LIMIT 1`,
        [salesOrderId]
    );

    return result.rows[0] || null;
};

// Include linked sales-order-item and box-specification fields.
// to_jsonb avoids assuming the exact columns in those tables.
const getItems = async (manufacturingOrderId, client = pool) => {
    const result = await client.query(
        `SELECT
        moi.*,
        to_jsonb(soi) AS linked_sales_order_item,
        to_jsonb(bs) AS linked_box_specification
     FROM public.manufacturing_order_item moi
     LEFT JOIN public.sales_order_item soi
       ON soi.sales_order_item_id = moi.sales_order_item_id
     LEFT JOIN public.box_specification bs
       ON bs.box_id = moi.box_id
     WHERE moi.manufacturing_order_id = $1
     ORDER BY moi.manufacturing_order_item_id`,
        [manufacturingOrderId]
    );

    return result.rows;
};

const getByIdWithRelations = async (id) => {
    const order = await getById(id);

    if (!order) return null;

    const [customer, salesOrder, items] = await Promise.all([
        getCustomerById(order.customer_id),
        getSalesOrderById(order.sales_order_id),
        getItems(order.manufacturing_order_id),
    ]);

    return {
        ...order,
        customer,
        sales_order: salesOrder,
        items,
    };
};

// Create the header and its items in one transaction.
const create = async (payload) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const header =
            payload.manufacturingOrder ||
            payload.manufacturing_order ||
            payload;

        const items = Array.isArray(payload.items)
            ? payload.items
            : [];

        if (
            !header.manufacturing_order_number ||
            !header.sales_order_id ||
            !header.customer_id ||
            !header.order_date
        ) {
            const error = new Error(
                "manufacturing_order_number, sales_order_id, customer_id and order_date are required."
            );
            error.statusCode = 400;
            throw error;
        }

        const headerResult = await client.query(
            `INSERT INTO public.manufacturing_order (
        manufacturing_order_number,
        sales_order_id,
        sales_order_number,
        customer_id,
        customer_code,
        order_date,
        expected_shipment_date,
        manufacturing_start_time,
        manufacturing_end_time,
        status,
        item_count,
        total_quantity,
        completed_quantity,
        rejected_quantity,
        estimated_hours,
        actual_hours,
        remarks,
        created_by
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        COALESCE($10, 'DRAFT'),
        $11, $12, $13, $14, $15, $16, $17, $18
      )
      RETURNING *`,
            [
                header.manufacturing_order_number,
                header.sales_order_id,
                header.sales_order_number || null,
                header.customer_id,
                header.customer_code || null,
                header.order_date,
                header.expected_shipment_date || null,
                header.manufacturing_start_time || null,
                header.manufacturing_end_time || null,
                header.status || "DRAFT",
                items.length,
                items.reduce(
                    (sum, item) => sum + (Number(item.quantity) || 0),
                    0
                ),
                Number(header.completed_quantity) || 0,
                Number(header.rejected_quantity) || 0,
                Number(header.estimated_hours) || 0,
                Number(header.actual_hours) || 0,
                header.remarks || null,
                header.created_by || null,
            ]
        );

        const order = headerResult.rows[0];
        const insertedItems = [];

        for (const item of items) {
            const result = await client.query(
                `INSERT INTO public.manufacturing_order_item (
          manufacturing_order_id,
          sales_order_item_id,
          box_id,
          box_spec,
          box_description,
          box_type,
          paper_type,
          box_size,
          ply,
          length,
          width,
          height,
          print_type,
          joint_type,
          top_paper_gsm,
          liner_gsm,
          flute_gsm,
          number_of_colour,
          print_area,
          print_note,
          print_art,
          board_size,
          bf,
          top_paper_number,
          two_ply_number,
          box_weight,
          total_weight,
          quantity,
          completed_quantity,
          rejected_quantity,
          unit_rate,
          total_amount,
          input_item_code,
          input_item_name,
          input_req_quantity,
          input_consume_quantity,
          input_item_unit,
          remarks,
          created_by
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
          $13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,
          $24,$25,$26,$27,$28,$29,$30, $31, $32, $33, $34,
          $35, $36, $37, $38, $39
        )
        RETURNING *`,

                [
                    order.manufacturing_order_id,
                    item.sales_order_item_id || null,
                    item.box_id || null,
                    item.box_spec || null,
                    item.box_description || null,
                    item.box_type || null,
                    item.paper_type || null,
                    item.box_size || null,
                    item.ply ?? null,
                    item.length ?? null,
                    item.width ?? null,
                    item.height ?? null,
                    item.print_type || null,
                    item.joint_type || null,
                    item.top_paper_gsm ?? null,
                    item.liner_gsm ?? null,
                    item.flute_gsm ?? null,
                    item.number_of_colour ?? null,
                    item.print_area || null,
                    item.print_note || null,
                    item.print_art || null,
                    item.board_size || null,
                    item.bf ?? null,
                    item.top_paper_number ?? null,
                    item.two_ply_number ?? null,

                    // These two values come from Quote Creation
                    // through Sales Order conversion
                    item.box_weight ?? null,
                    item.total_weight ?? null,

                    Number(item.quantity) || 0,
                    Number(item.completed_quantity) || 0,
                    Number(item.rejected_quantity) || 0,
                    item.unit_rate ?? null,
                    item.total_amount ?? null,

                    // Material Availability values must match the column order
                    item.input_item_code || null,
                    item.input_item_name || null,
                    item.input_req_quantity ?? null,
                    item.input_consume_quantity ?? 0,
                    item.input_item_unit || "KG",

                    item.remarks || null,
                    item.created_by || header.created_by || null
                ]

            );

            insertedItems.push(result.rows[0]);
        }

        await client.query("COMMIT");

        return {
            ...order,
            items: insertedItems,
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

const update = async (id, payload) => {
    const header =
        payload.manufacturingOrder ||
        payload.manufacturing_order ||
        payload;

    const allowedFields = [
        "manufacturing_order_number",
        "sales_order_id",
        "sales_order_number",
        "customer_id",
        "customer_code",
        "order_date",
        "expected_shipment_date",
        "manufacturing_start_time",
        "manufacturing_end_time",
        "status",
        "completed_quantity",
        "rejected_quantity",
        "estimated_hours",
        "actual_hours",
        "remarks",
        "modified_by",
    ];

    const fields = allowedFields.filter((field) =>
        Object.prototype.hasOwnProperty.call(header, field)
    );

    if (!fields.length) {
        const error = new Error(
            "No supported manufacturing order fields were provided."
        );
        error.statusCode = 400;
        throw error;
    }

    const values = fields.map((field) => header[field]);
    const setClause = fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");

    values.push(id);

    const result = await pool.query(
        `UPDATE public.manufacturing_order
        SET ${setClause},
            modified_at = CURRENT_TIMESTAMP
      WHERE manufacturing_order_id = $${values.length}
      RETURNING *`,
        values
    );

    return result.rows[0] || null;
};

const updateStatus = async (id, status, modifiedBy = null) => {
    const result = await pool.query(
        `UPDATE public.manufacturing_order
        SET status = $1,
            modified_by = $2,
            modified_at = CURRENT_TIMESTAMP
      WHERE manufacturing_order_id = $3
      RETURNING *`,
        [status, modifiedBy, id]
    );

    return result.rows[0] || null;
};


const getBySalesOrderId = async (salesOrderId) => {
    const result = await pool.query(
        `SELECT *
     FROM public.manufacturing_order
     WHERE sales_order_id = $1
     LIMIT 1`,
        [salesOrderId]
    );

    return result.rows[0] || null;
};


const getSalesOrderItems = async (salesOrderId) => {
    const result = await pool.query(
        `SELECT
       soi.sales_order_item_id,
       to_jsonb(soi) AS item_data
     FROM public.sales_order_item AS soi
     WHERE soi.sales_order_id = $1
     ORDER BY soi.sales_order_item_id`,
        [salesOrderId]
    );

    return result.rows;
};



module.exports = {
    getAll,
    getById,
    getByIdWithRelations,
    getCustomerById,
    getSalesOrderById,
    getBySalesOrderId,
    getSalesOrderItems,
    getItems,
    create,
    update,
    updateStatus,
};