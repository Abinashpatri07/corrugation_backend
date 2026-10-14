const repository = require("./manufacturingOrder.repository");

const firstDefined = (...values) =>
    values.find(
        (value) =>
            value !== undefined &&
            value !== null &&
            value !== ""
    );

const getCustomerName = (customer) => {
    if (!customer) return null;

    return firstDefined(
        customer.display_name,
        customer.customer_name,
        customer.company_name,
        customer.organization_name,
        customer.name,
        [
            customer.first_name,
            customer.last_name,
        ].filter(Boolean).join(" ").trim(),
        null
    );
};

const normalizeItem = (item) => {
    const salesItem = item.linked_sales_order_item || {};
    const box = item.linked_box_specification || {};

    return {
        ...item,

        product_name: firstDefined(
            item.box_description,
            item.box_spec,
            salesItem.item_name,
            salesItem.item_description,
            box.item_name,
            box.item_description,
            null
        ),

        box_type: firstDefined(
            item.box_type,
            salesItem.Box_Type,
            salesItem.box_type,
            box.box_type,
            null
        ),

        paper_type: firstDefined(
            item.paper_type,
            salesItem.Paper_Type,
            salesItem.paper_type,
            box.paper_type,
            null
        ),

        box_size: firstDefined(
            item.box_size,
            salesItem.Box_Size,
            salesItem.box_size,
            box.box_size,
            null
        ),

        ply: firstDefined(
            item.ply,
            salesItem.Ply_Type,
            salesItem.ply_type,
            box.ply,
            null
        ),

        length: firstDefined(
            item.length,
            salesItem.board_length_cm,
            salesItem.board_length,
            box.length,
            null
        ),

        width: firstDefined(
            item.width,
            salesItem.board_width_cm,
            salesItem.board_width,
            box.width,
            null
        ),

        height: firstDefined(
            item.height,
            salesItem.board_height_cm,
            salesItem.board_height,
            box.height,
            null
        ),

        board_size: firstDefined(
            item.board_size,
            salesItem.board_size,
            salesItem.Board_Size,
            box.board_size,
            box.Board_Size,
            null
        ),

        top_paper_gsm: firstDefined(
            item.top_paper_gsm,
            salesItem.Top_paper_gsm,
            salesItem.top_paper_gsm,
            null
        ),

        liner_gsm: firstDefined(
            item.liner_gsm,
            salesItem.liner_gsm,
            null
        ),

        flute_gsm: firstDefined(
            item.flute_gsm,
            salesItem.flute_gsm,
            null
        ),

        top_paper_number: firstDefined(
            item.top_paper_number,
            salesItem.top_paper_number,
            box.top_paper_number,
            null
        ),

        two_ply_number: firstDefined(
            item.two_ply_number,
            salesItem.two_ply_number,
            box.two_ply_number,
            null
        ),

        bf: firstDefined(
            item.bf,
            salesItem.bf,
            salesItem.Busting_Factor,
            box.bf,
            box.Busting_Factor,
            null
        ),

        box_weight: firstDefined(
            item.box_weight,
            salesItem.box_weight,
            salesItem.Unit_Box_Weight,
            box.box_weight,
            box.Unit_Box_Weight,
            null
        ),

        total_weight: firstDefined(
            item.total_weight,
            salesItem.total_weight,
            salesItem.Total_Box_Weight,
            box.total_weight,
            box.Total_Box_Weight,
            null
        ),

        number_of_colour: firstDefined(
            item.number_of_colour,
            salesItem.number_of_colors,
            salesItem.number_of_colour,
            null
        ),

        print_note: firstDefined(
            item.print_note,
            salesItem.printing_notes,
            salesItem.print_note,
            null
        ),

        print_art: firstDefined(
            item.print_art,
            salesItem.artwork_file_url,
            salesItem.print_art,
            null
        ),
    };
};

const formatDetails = (order) => {
    if (!order) return null;

    const customer = order.customer || {};
    const items = (order.items || []).map(normalizeItem);
    const firstItem = items[0] || null;

    const totalQuantity = items.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
    );

    return {
        ...order,

        customer_profile: {
            id: customer.customer_id || order.customer_id,

            code: firstDefined(
                customer.customer_code,
                customer.customer_code_number,
                order.customer_code,
                null
            ),

            name: getCustomerName(customer),

            gstin: firstDefined(
                customer.gstin,
                customer.gst_number,
                customer.gst_no,
                null
            ),


            point_of_contact: [
                customer.primary_contact_prefix,
                customer.primary_contact_first_name,
                customer.primary_contact_last_name,
            ]
                .filter(Boolean)
                .join(" ") || null,

            raw: customer,
        },

        details: {
            manufacturing_order_number:
                order.manufacturing_order_number,

            order_date: order.order_date,

            expected_shipment_date:
                order.expected_shipment_date,

            manufacturing_start_time:
                order.manufacturing_start_time || "10:00:00",

            manufacturing_end_time:
                order.manufacturing_end_time || "20:00:00",

            status: order.status,
        },

        // The existing UI currently displays one product specification card.
        product_specification: firstItem,

        items,

        item_count: items.length,

        total_quantity:
            order.total_quantity ?? totalQuantity,

        paper_details: firstItem
            ? {
                top_paper_gsm: firstItem.top_paper_gsm,
                liner_gsm: firstItem.liner_gsm,
                flute_gsm: firstItem.flute_gsm,
            }
            : null,

        box_weight_details: firstItem
            ? {
                box_weight: firstItem.box_weight,
                total_weight: firstItem.total_weight,
            }
            : null,

        board_details: firstItem
            ? {
                board_size: firstItem.board_size,
                top_paper_number: firstItem.top_paper_number,
                two_ply_number: firstItem.two_ply_number,
                ply: firstItem.ply,
                quantity: firstItem.quantity,
            }
            : null,

        production_schedule: {
            start_time:
                order.manufacturing_start_time || "10:00:00",

            end_time:
                order.manufacturing_end_time || "20:00:00",

            estimated_hours: order.estimated_hours,
            actual_hours: order.actual_hours,
        },


        job_cards: [],
    };
};

const list = async (options) => {
    return repository.getAll(options);
};

const getById = async (id) => {
    const order = await repository.getByIdWithRelations(id);
    return formatDetails(order);
};

const create = async (payload) => {
    const created = await repository.create(payload);

    return getById(created.manufacturing_order_id);
};

const update = async (id, payload) => {
    const updated = await repository.update(id, payload);

    if (!updated) return null;

    return getById(updated.manufacturing_order_id);
};

const updateStatus = async (id, status, modifiedBy) => {
    const updated = await repository.updateStatus(
        id,
        status,
        modifiedBy
    );

    if (!updated) return null;

    return getById(updated.manufacturing_order_id);
};



const convertFromSalesOrder = async (salesOrderId) => {
    // Find the original Sales Order.
    const salesOrder = await repository.getSalesOrderById(
        salesOrderId
    );

    if (!salesOrder) {
        const error = new Error("Sales Order not found.");
        error.statusCode = 404;
        throw error;
    }

    // Prevent duplicate conversions.
    const existing = await repository.getBySalesOrderId(
        salesOrderId
    );

    if (existing) {
        const error = new Error(
            `This Sales Order is already converted to ${existing.manufacturing_order_number}.`
        );
        error.statusCode = 409;
        throw error;
    }

    if (!salesOrder.customer_id) {
        const error = new Error(
            "Customer ID is missing from the Sales Order."
        );
        error.statusCode = 400;
        throw error;
    }

    // Read the Sales Order's items.
    const salesItems = await repository.getSalesOrderItems(
        salesOrderId
    );

    if (!salesItems.length) {
        const error = new Error(
            "No items found for this Sales Order."
        );
        error.statusCode = 400;
        throw error;
    }

    const items = salesItems.map((row) => {
        const item = row.item_data || row;

        const quantity = Number(
            item.quantity_boxes ??
            item.quantity ??
            item.ordered_quantity ??
            0
        );

        const rate = Number(
            item.unit_rate ??
            item.rate ??
            item.unit_price ??
            0
        );

        return {
            quantity: quantity,
            sales_order_item_id: item.sales_order_item_id ?? null,
            box_id: item.box_id ?? null,
            box_spec: item.box_size ?? item.Box_Size ?? null,
            box_description:
                item.item_name ??
                item.item_description ??
                "Sales Order Item",
            box_type: item.box_type ?? item.Box_Type ?? null,
            paper_type: item.paper_type ?? item.Paper_Type ?? null,
            box_size: item.box_size ?? item.Box_Size ?? null,
            ply: item.ply ?? item.ply_type ?? item.Ply_Type ?? null,
            length: item.board_length_cm ?? null,
            width: item.board_width_cm ?? null,
            height: item.board_height_cm ?? null,
            print_type: item.print_type ?? item.Print_Type ?? null,
            joint_type: item.joint_type ?? item["Joint Type"] ?? null,
            top_paper_gsm:
                item.top_paper_gsm ?? item.Top_paper_gsm ?? null,
            liner_gsm: item.liner_gsm ?? item.Liner_gsm ?? null,
            flute_gsm: item.flute_gsm ?? item.Flute_gsm ?? null,
            number_of_colour:
                item.number_of_colors ?? item.number_of_colour ?? null,
            print_area: item.print_area ?? null,
            print_note: item.printing_notes ?? null,
            print_art: item.artwork_file_url ?? null,
            board_size: item.board_size ?? item.Board_Size ?? null,

            bf: item.bf ?? item.Busting_Factor ?? null,

            top_paper_number: item.top_paper_number ?? null,
            input_item_code: item.com_item_code ?? null,
            input_item_name: item.com_item_name ?? null,
            input_req_quantity: item.com_req_quantity ?? null,
            input_item_unit: item.com_item_unit ?? null,

            two_ply_number: item.two_ply_number ?? null,

            box_weight:
                item.box_weight ??
                item.unit_box_weight ??
                item.Unit_Box_Weight ??
                null,

            total_weight:
                item.total_weight ??
                item.total_box_weight ??
                item.Total_Box_Weight ??
                null,
            unit_rate: rate,
            total_amount: Number(
                item.total_amount ??
                item.item_amount ??
                item.itemAmount ??
                quantity * rate
            ),
        };
    });

    const today = new Date().toISOString().slice(0, 10);
    const orderNumber =
        `MO-${Date.now()}`;

    const created = await repository.create({
        manufacturing_order_number: orderNumber,
        sales_order_id: salesOrder.sales_order_id,
        sales_order_number:
            salesOrder.sales_order_number ??
            salesOrder.sales_order_no ??
            salesOrder.salesOrderNo ??
            null,
        customer_id: salesOrder.customer_id,
        customer_code: salesOrder.customer_code ?? null,
        order_date:
            salesOrder.order_date ?? salesOrder.date ?? today,
        expected_shipment_date:
            salesOrder.expected_shipment_date ?? null,
        status: "DRAFT",
        remarks: "Created from Sales Order",
        items,
    });

    return getById(created.manufacturing_order_id);
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
     FROM public.sales_order_item soi
     WHERE soi.sales_order_id = $1
     ORDER BY soi.sales_order_item_id`,
        [salesOrderId]
    );

    return result.rows;
};


module.exports = {
    list,
    getById,
    create,
    update,
    updateStatus,
    convertFromSalesOrder,
};