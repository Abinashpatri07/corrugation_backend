const service = require("./manufacturingOrder.service");

const sendError = (res, error) => {
  console.error("Manufacturing Order API error:", error);

  const status =
    error.statusCode ||
    (error.code === "23505" ? 409 : 500);

  res.status(status).json({
    success: false,

    message:
      status === 500
        ? "Failed to process manufacturing order request."
        : error.message,

    ...(process.env.NODE_ENV !== "production"
      ? { detail: error.message }
      : {}),
  });
};

const getAll = async (req, res) => {
  try {
    const data = await service.list({
      search: req.query.search || "",
      status: req.query.status || "",
      limit: req.query.limit || 100,
      offset: req.query.offset || 0,
    });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    sendError(res, error);
  }
};

const getById = async (req, res) => {
  try {
    const data = await service.getById(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Manufacturing order not found.",
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    sendError(res, error);
  }
};

const create = async (req, res) => {
  try {
    const data = await service.create(req.body);

    res.status(201).json({
      success: true,
      message: "Manufacturing order created successfully.",
      data,
    });
  } catch (error) {
    sendError(res, error);
  }
};

const update = async (req, res) => {
  try {
    const data = await service.update(
      req.params.id,
      req.body
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Manufacturing order not found.",
      });
    }

    res.json({
      success: true,
      message: "Manufacturing order updated successfully.",
      data,
    });
  } catch (error) {
    sendError(res, error);
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status, modified_by } = req.body;

    const allowedStatuses = [
      "DRAFT",
      "PLANNED",
      "RELEASED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ];

    const normalizedStatus = String(status || "").toUpperCase();

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Use DRAFT, PLANNED, RELEASED, IN_PROGRESS, COMPLETED or CANCELLED.",
      });
    }

    const data = await service.updateStatus(
      req.params.id,
      normalizedStatus,
      modified_by || null
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Manufacturing order not found.",
      });
    }

    res.json({
      success: true,
      message: "Manufacturing order status updated successfully.",
      data,
    });
  } catch (error) {
    sendError(res, error);
  }
};

const convertFromSalesOrder = async (req, res) => {
  try {
    const { sales_order_id } = req.body;

    if (!sales_order_id) {
      return res.status(400).json({
        success: false,
        message: "Sales Order ID is required.",
      });
    }

    const data = await service.convertFromSalesOrder(
      sales_order_id
    );

    return res.status(201).json({
      success: true,
      message: "Sales Order converted successfully.",
      data,
    });
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  updateStatus,
  convertFromSalesOrder,
};