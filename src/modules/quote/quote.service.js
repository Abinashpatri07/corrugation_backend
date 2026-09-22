/**
 * Calculates board size needed to construct one box.
 *
 * Input dimensions: cm
 *
 * L   = Box Length
 * W   = Box Width
 * H   = Box Height
 * QTY = Required box quantity
 * P   = Ply type
 *
 * Machine:
 * MAX DECKLE = 128 cm
 * MAX CUTTING = 175 cm
 *
 * TA = Trim Allowance
 * GA = Glue Allowance
 */

/**
 * ============================================================
 * BOARD SIZE CALCULATOR
 * ============================================================
 *
 * INPUT DIMENSIONS: CM
 *
 * BXL = Box Length
 * BXW = Box Width
 * BXH = Box Height
 *
 * QTY = Required Box Quantity
 * P   = Ply Type
 *
 * MACHINE LIMITS:
 * MAX DECKLE  = 128 cm
 * MAX CUTTING = 175 cm
 *
 * ALLOWANCES:
 * TA = Trim Allowance = 2 cm
 * GA = Glue Allowance = 5 cm
 *
 *
 * BASIC FORMULAS
 * ------------------------------------------------------------
 *
 * Sudo Board Width:
 * SBW = BXW + BXH
 *
 * Sudo Board Length:
 * SBL = 2 × (BXL + BXW)
 *
 * Alternate Board Width:
 * ABW = BXL + BXW
 *
 * Alternate Board Length:
 * ABL = 2 × (BXW + BXH)
 * ============================================================
 */
const pool = require('../../config/database');

function calculateBoardSize(
    BXL,
    BXW,
    BXH,
    QTY = 1,
    P = 5,
    topGsm = 145,
    linerGsm = 120,
    fluteGsm = 120,
    fluteFactor = 1.5,
    maxDeckle = 128,
    maxCutting = 175,
    TA = 2,
    GA = 5
) {
    // =========================================================
    // 1. Convert / validate input
    // =========================================================

    const L = Number(BXL);
    const W = Number(BXW);
    const H = Number(BXH);
    const quantity = Number(QTY);
    const ply = Number(P);

    if (
        !Number.isFinite(L) ||
        !Number.isFinite(W) ||
        !Number.isFinite(H) ||
        L <= 0 ||
        W <= 0 ||
        H <= 0
    ) {
        return {
            success: false,
            error: "BXL, BXW and BXH must be positive numbers."
        };
    }

    if (
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {
        return {
            success: false,
            error: "QTY must be greater than 0."
        };
    }

    // =========================================================
    // 2. SUDO DIMENSIONS
    // =========================================================

    const SBW = W + H;

    const SBL = 2 * (L + W);

    // =========================================================
    // 3. ALTERNATE DIMENSIONS
    // =========================================================

    const ABW = L + W;

    const ABL = 2 * (W + H);

    // =========================================================
    // 4. HELPER FUNCTIONS
    // =========================================================

    function round(value) {
        return Number(value.toFixed(1));
    }

    /**
     * Number of ups that can physically fit.
     *
     * IMPORTANT:
     * Allowance is removed BEFORE calculating UPS.
     *
     * Example:
     *
     * MAX DECKLE = 128
     * TA = 2
     * SBW = 53
     *
     * UPS = floor((128 - 2) / 53)
     *     = floor(126 / 53)
     *     = 2
     */
    function getUps(limit, dimension, allowance = 0) {
        if (dimension <= 0) {
            return 0;
        }

        const availableSpace =
            limit - allowance;

        if (availableSpace < dimension) {
            return 0;
        }

        return Math.floor(
            availableSpace / dimension
        );
    }

    /**
     * Whole-number paper quantity.
     */
    function calculatePapers(
        boxQuantity,
        boxesPerBoard,
        piecesPerBox = 1
    ) {
        if (boxesPerBoard <= 0) {
            return 0;
        }

        const totalBoardPieces =
            boxQuantity * piecesPerBox;

        return Math.ceil(
            totalBoardPieces / boxesPerBoard
        );
    }

    /**
     * 2-ply calculation.
     *
     * Based on the ply type:
     * 3-ply -> 1 two-ply per paper
     * 5-ply -> 2 two-ply per paper
     * 7-ply -> 3 two-ply per paper
     */
    function calculateTwoPly(papers, ply) {
        return papers * Math.floor((ply - 1) / 2);
    }

    function makeResult(bestScenario) {
        const boardArea = bestScenario.boardWidth * bestScenario.boardLength;
        const boardAreaM2 = boardArea / 10000;
        const linerFlutePairs = (ply - 1) / 2;
        
        const topWt = boardAreaM2 * topGsm;
        const linerWt = boardAreaM2 * linerGsm * linerFlutePairs;
        const fluteWt = boardAreaM2 * fluteGsm * fluteFactor * linerFlutePairs;
        
        const boardWeightKg = (topWt + linerWt + fluteWt) / 1000;
        const boxWeightKg = boardWeightKg * bestScenario.piecesPerBox;
        const grossWeightKg = boxWeightKg * 1.05; // 5% variation
        const netWeightKg = grossWeightKg * 0.95; // 5% reduction

        const papers = Math.ceil((quantity * bestScenario.piecesPerBox) / bestScenario.boxesPerBoard);

        const boxArea = (2 * ((L * W) + (L * H) + (W * H))) + (W * W);
        const areaBoxCount = Math.floor(boardArea / boxArea);

        // Calculate total required weights
        const reqTopWt = (topWt * papers) / 1000;
        const reqLinerWt = (linerWt * papers) / 1000;
        const reqFluteWt = (fluteWt * papers) / 1000;

        const deckle = round(bestScenario.boardWidth);

        // Helper function to mock checking inventory and finding next available sizes (uske upar wale)
        function checkAndGenerateMaterial(typeCode, gsm, reqWeight, startCodeId) {
            const exactDeckleStr = String(deckle).padStart(3, '0');
            
            // Mock: Let's assume the exact size is out of stock, so we find the next available size.
            // In a real scenario, this would query the DB.
            const isExactAvailable = false; 
            
            if (isExactAvailable) {
                return [{
                    itemCode: `RM-${String(startCodeId).padStart(4, '0')}`,
                    itemName: `CYS-${exactDeckleStr}CMS-${gsm}GSM-18BF (${typeCode})`,
                    totalWeight: 1500,
                    requiredWeight: Number(reqWeight.toFixed(2)),
                    indicator: 'Green'
                }];
            } else {
                // Return ONLY the next available larger size, instead of showing all of them.
                const nextDeckle = deckle + 5;
                return [{
                    itemCode: `RM-${String(startCodeId + 1).padStart(4, '0')}`,
                    itemName: `CYS-${String(nextDeckle).padStart(3, '0')}CMS-${gsm}GSM-18BF (${typeCode} - Alt)`,
                    totalWeight: 1000,
                    requiredWeight: Number(reqWeight.toFixed(2)),
                    indicator: 'Green' // Available alternative
                }];
            }
        }

        const materialAvailability = [
            ...checkAndGenerateMaterial('Top', topGsm, reqTopWt, 1),
            ...checkAndGenerateMaterial('Flute', fluteGsm, reqFluteWt, 4)
        ];

        if (ply > 2) {
            materialAvailability.push(...checkAndGenerateMaterial('Liner', linerGsm, reqLinerWt, 7));
        }

        return {
            success: true,
            scenario: bestScenario.scenario,
            mode: bestScenario.mode,
            orientation: bestScenario.orientation,
            box: { length: L, width: W, height: H },
            sudoSize: { width: round(SBW), length: round(SBL) },
            alternateSize: { width: round(ABW), length: round(ABL) },
            widthUps: bestScenario.widthUps,
            lengthUps: bestScenario.lengthUps,
            ups: bestScenario.boxesPerBoard,
            boxCountByArea: areaBoxCount,
            pieces: bestScenario.piecesPerBox,
            boardWidth: round(bestScenario.boardWidth),
            boardLength: round(bestScenario.boardLength),
            boardSize: [round(bestScenario.boardWidth), round(bestScenario.boardLength)],
            papers: papers,
            twoPly: calculateTwoPly(papers, ply),
            quantity: quantity,
            ply,
            weight: {
                boardWeightKg: Number(boardWeightKg.toFixed(4)),
                boxWeightKg: Number(boxWeightKg.toFixed(4)),
                grossWeightKg: Number(grossWeightKg.toFixed(4)),
                netWeightKg: Number(netWeightKg.toFixed(4)),
                topGsm, linerGsm, fluteGsm, fluteFactor
            },
            materialAvailability,
            reason: bestScenario.reason
        };
    }

    const scenarios = [];

    // =========================================================
    // SCENARIO 1: STANDARD
    // =========================================================
    const wUpsStd = getUps(maxDeckle, SBW, TA);
    const lUpsStd = getUps(maxCutting, SBL, GA);
    if (wUpsStd >= 1 && lUpsStd >= 1) {
        scenarios.push({
            scenario: 1,
            orientation: "STANDARD",
            mode: wUpsStd * lUpsStd > 1 ? "MULTIPLE_BOX" : "NO_JOINT",
            widthUps: wUpsStd,
            lengthUps: lUpsStd,
            boxesPerBoard: wUpsStd * lUpsStd,
            piecesPerBox: 1,
            boardWidth: (wUpsStd * SBW) + TA,
            boardLength: (lUpsStd * SBL) + GA,
            reason: "Standard orientation fits."
        });
    }

    // =========================================================
    // SCENARIO 2/4: ALTERNATE
    // =========================================================
    const wUpsAlt = getUps(maxDeckle, ABW, TA);
    const lUpsAlt = getUps(maxCutting, ABL, GA);
    if (wUpsAlt >= 1 && lUpsAlt >= 1) {
        scenarios.push({
            scenario: 2,
            orientation: "ALTERNATE",
            mode: wUpsAlt * lUpsAlt > 1 ? "MULTIPLE_BOX" : "JOINT_POSSIBLE",
            widthUps: wUpsAlt,
            lengthUps: lUpsAlt,
            boxesPerBoard: wUpsAlt * lUpsAlt,
            piecesPerBox: 1,
            boardWidth: (wUpsAlt * ABW) + TA,
            boardLength: (lUpsAlt * ABL) + GA,
            reason: "Alternate orientation fits."
        });
    }

    // =========================================================
    // SCENARIO 5: JOINT (2 pieces per box)
    // =========================================================
    const jointWidth = SBW + TA;
    const jointLength = (L + W) + GA + TA;
    if (jointWidth <= maxDeckle && jointLength <= maxCutting) {
        scenarios.push({
            scenario: 5,
            orientation: "STANDARD_JOINT",
            mode: "JOINT",
            widthUps: 1,
            lengthUps: 1,
            boxesPerBoard: 1,
            piecesPerBox: 2,
            boardWidth: jointWidth,
            boardLength: jointLength,
            reason: "Box is made of 2 board pieces joined."
        });
    }

    // =========================================================
    // SCENARIO 3: SPLIT BOARD
    // =========================================================
    const canSplitWidth = SBW > maxDeckle && SBW <= (2 * maxDeckle);
    const canSplitLength = SBL > maxCutting && SBL <= (2 * maxCutting);
    if (canSplitWidth || canSplitLength) {
        const splitWidthPieces = canSplitWidth ? 2 : 1;
        const splitLengthPieces = canSplitLength ? 2 : 1;
        const splitBoardWidth = canSplitWidth ? (SBW / 2) + TA : SBW + TA;
        const splitBoardLength = canSplitLength ? (SBL / 2) + GA : SBL + GA;
        
        if (splitBoardWidth <= maxDeckle && splitBoardLength <= maxCutting) {
            scenarios.push({
                scenario: 3,
                orientation: "STANDARD_SPLIT",
                mode: "MULTI_BOARD",
                widthUps: 1,
                lengthUps: 1,
                boxesPerBoard: 1,
                piecesPerBox: splitWidthPieces * splitLengthPieces,
                boardWidth: splitBoardWidth,
                boardLength: splitBoardLength,
                reason: "Board split to fit machine limits."
            });
        }
    }

    // =========================================================
    // SELECT BEST SCENARIO
    // =========================================================
    if (scenarios.length > 0) {
        // Sort criteria:
        // 1. Max boxesPerBoard (we want max yield)
        // 2. Min piecesPerBox (we want 1-piece boxes ideally)
        // 3. Min boardArea (least waste)
        scenarios.sort((a, b) => {
            // 1. MORE BOXES PER BOARD = HIGHER PRIORITY
            if (a.boxesPerBoard !== b.boxesPerBoard) {
                return b.boxesPerBoard - a.boxesPerBoard; // DESC
            }
            
            // 2. FEWER PIECES PER BOX = SECOND PRIORITY
            if (a.piecesPerBox !== b.piecesPerBox) {
                return a.piecesPerBox - b.piecesPerBox; // ASC
            }
            
            // 3. SMALLER BOARD AREA = THIRD PRIORITY
            const areaA = a.boardWidth * a.boardLength;
            const areaB = b.boardWidth * b.boardLength;
            return areaA - areaB; // ASC (less area = better if yield is same)
        });

        return makeResult(scenarios[0]);
    }

    // =========================================================
    // NO SOLUTION
    // =========================================================

    return {
        success: false,
        error: "Cannot calculate a board size within the configured machine limits.",
        box: { length: L, width: W, height: H },
        sudoSize: { width: round(SBW), length: round(SBL) },
        alternateSize: { width: round(ABW), length: round(ABL) },
        machineLimits: { maxDeckle, maxCutting }
    };
}

async function createQuote(data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get next quote id for formatting
        const countRes = await client.query('SELECT COALESCE(MAX(quote_id), 0) + 1 as next_id FROM quote');
        const nextId = countRes.rows[0].next_id;
        const quoteNumber = `Q-${String(nextId).padStart(6, '0')}`;

        // Insert into quote
        const quoteInsertQuery = `
            INSERT INTO quote (
                customer_id, quote_date, expiry_date, sales_man, project_name, reference_no,
                created_at, created_by, quote_number
            )
            VALUES ($1, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', $2, $3, $4, NOW(), 1, $5)
            RETURNING quote_id
        `;
        
        // Mock sales_man to 1 if not provided (Manoj Kumar in UI)
        const quoteValues = [
            data.customerId,
            data.salesMan || 1,
            data.projectName || '',
            data.referenceNo || '',
            quoteNumber
        ];

        const quoteRes = await client.query(quoteInsertQuery, quoteValues);
        const quoteId = quoteRes.rows[0].quote_id;

        // Insert into quote_item
        if (data.items && data.items.length > 0) {
            const item = data.items[0]; // Currently UI only supports 1 item at a time
            const itemInsertQuery = `
                INSERT INTO quote_item (
                    quote_id, box_length, box_width, box_height, quantity,
                    board_size, box_weight, total_weight, ply_type, top_gsm, liner_gsm, flute_gsm, created_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
            `;
            
            const itemValues = [
                quoteId,
                item.length,
                item.width,
                item.height,
                item.quantity,
                item.boardSize || '',
                item.boxWeight || 0,
                item.totalWeight || 0,
                item.plyType || 3,
                item.topGsm || 0,
                item.linerGsm || 0,
                item.fluteGsm || 0
            ];
            
            await client.query(itemInsertQuery, itemValues);
        }

        await client.query('COMMIT');
        return { quoteId };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

async function getAllQuotes() {
    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                q.quote_id as id,
                TO_CHAR(q.quote_date, 'DD/MM/YYYY') as date,
                q.quote_number as "quoteNo",
                c.display_name as "customerName",
                MAX(CONCAT(qi.ply_type, '-Ply')) as "boxSpec",
                SUM(qi.quantity) as quantity,
                SUM(qi.total_weight) as "totalWeight"
            FROM quote q
            LEFT JOIN customer c ON q.customer_id = c.customer_id
            LEFT JOIN quote_item qi ON q.quote_id = qi.quote_id
            GROUP BY q.quote_id, q.quote_date, q.quote_number, c.display_name, q.created_at
            ORDER BY q.created_at DESC
        `;
        const res = await client.query(query);
        
        // Calculate amount dynamically as we did in frontend (total_weight * 50) + 18% GST
        const quotes = res.rows.map(row => {
            const weight = parseFloat(row.totalWeight) || 0;
            const amount = (weight * 50 * 1.18).toFixed(2);
            return {
                ...row,
                amount: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount).replace('₹', '').trim()
            };
        });

        return quotes;
    } finally {
        client.release();
    }
}

async function getQuoteById(id) {
    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                q.quote_id as id,
                TO_CHAR(q.quote_date, 'DD/MM/YYYY') as date,
                q.quote_number as "quoteNo",
                c.display_name as "customerName",
                CONCAT_WS(', ', ba.street_1, ba.street_2, ba.city, ba.state, ba.zip_code) as "billingAddress",
                CONCAT_WS(', ', sa.street_1, sa.street_2, sa.city, sa.state, sa.zip_code) as "shippingAddress",
                c.gstin as "gstin",
                CONCAT_WS(' ', c.primary_contact_first_name, c.primary_contact_last_name) as "poc",
                q.sales_man as "salesperson",
                TO_CHAR(q.expiry_date, 'DD/MM/YYYY') as "expectedShipment",
                CONCAT(qi.ply_type, '-Ply') as "boxSpec",
                qi.quantity as quantity,
                qi.total_weight as "totalWeight",
                qi.box_length as "boxLength",
                qi.box_width as "boxWidth",
                qi.box_height as "boxHeight",
                qi.ply_type as "plyType",
                qi.top_gsm as "topGsm",
                qi.liner_gsm as "linerGsm",
                qi.flute_gsm as "fluteGsm",
                qi.board_size as "boardSize",
                qi.box_type as "boxType",
                qi.paper_type as "paperType",
                qi.box_size as "boxSize"
            FROM quote q
            LEFT JOIN customer c ON q.customer_id = c.customer_id
            LEFT JOIN customer_addresses ba ON c.customer_id = ba.customer_id AND ba.address_type = 'BILLING'
            LEFT JOIN customer_addresses sa ON c.customer_id = sa.customer_id AND sa.address_type = 'SHIPPING'
            LEFT JOIN quote_item qi ON q.quote_id = qi.quote_id
            WHERE q.quote_id = $1
        `;
        const res = await client.query(query, [id]);
        
        if (res.rows.length === 0) {
            return null;
        }

        const row = res.rows[0];
        const weight = parseFloat(row.totalWeight) || 0;
        const subTotal = (weight * 50).toFixed(2);
        const gst = (weight * 50 * 0.18).toFixed(2);
        const amount = (parseFloat(subTotal) + parseFloat(gst)).toFixed(2);
        
        return {
            ...row,
            subTotal: new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(subTotal),
            gst: new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(gst),
            amount: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount).replace('₹', '').trim()
        };
    } finally {
        client.release();
    }
}

module.exports = {
    calculateBoardSize,
    createQuote,
    getAllQuotes,
    getQuoteById
};
