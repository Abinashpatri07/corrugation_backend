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

function calculateBoardSize(
    BXL,
    BXW,
    BXH,
    QTY = 1,
    P = 5,
    gsm = 145,
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

    /**
     * Common response object.
     */
    function makeResult({
        scenario,
        orientation,
        mode,
        boardWidth,
        boardLength,
        widthUps,
        lengthUps,
        boxesPerBoard,
        piecesPerBox,
        papers,
        reason
    }) {
        const boxArea = (2 * ((L * W) + (L * H) + (W * H))) + (W * W);
        const boardArea = boardWidth * boardLength;
        let areaBoxCount = Math.floor(boardArea / boxArea);
        
        if (areaBoxCount < 1) {
            areaBoxCount = 1;
        }

        const areaPapers = Math.ceil(quantity / areaBoxCount);

        const boardAreaM2 = boardArea / 10000;
        const effectiveLayerFactor = 1 + ((ply - 1) / 2) * (1 + fluteFactor);
        const boardWeightKg = (boardAreaM2 * gsm * effectiveLayerFactor) / 1000;
        const boxWeightKg = boardWeightKg * piecesPerBox;
        const grossWeightKg = boxWeightKg * 1.05; // 5% variation
        const netWeightKg = grossWeightKg * 0.95; // 5% reduction

        return {
            success: true,

            scenario,

            mode,

            orientation,

            box: {
                length: L,
                width: W,
                height: H
            },

            sudoSize: {
                width: round(SBW),
                length: round(SBL)
            },

            alternateSize: {
                width: round(ABW),
                length: round(ABL)
            },

            widthUps,

            lengthUps,

            ups: areaBoxCount,

            pieces: piecesPerBox,

            boardWidth: round(boardWidth),

            boardLength: round(boardLength),

            boardSize: [
                round(boardWidth),
                round(boardLength)
            ],

            papers: areaPapers,

            twoPly:
                calculateTwoPly(
                    areaPapers,
                    ply
                ),

            quantity: quantity,

            ply,

            weight: {
                boardWeightKg: Number(boardWeightKg.toFixed(4)),
                boxWeightKg: Number(boxWeightKg.toFixed(4)),
                grossWeightKg: Number(grossWeightKg.toFixed(4)),
                netWeightKg: Number(netWeightKg.toFixed(4)),
                gsm,
                effectiveLayerFactor
            },

            reason
        };
    }

    // =========================================================
    // SCENARIO 1
    // =========================================================
    //
    // SBW <= 128
    // AND
    // SBL <= 175
    //
    // Standard orientation fits directly.
    // =========================================================

    if (
        SBW <= maxDeckle &&
        SBL <= maxCutting
    ) {
        const WUps =
            getUps(
                maxDeckle,
                SBW,
                TA
            );

        const LUps =
            getUps(
                maxCutting,
                SBL,
                GA
            );

        if (
            WUps >= 1 &&
            LUps >= 1
        ) {
            const BDW =
                (WUps * SBW) + TA;

            const BDL =
                (LUps * SBL) + GA;

            // Final safety check
            if (
                BDW <= maxDeckle &&
                BDL <= maxCutting
            ) {
                const boxesPerBoard =
                    WUps * LUps;

                const papers =
                    calculatePapers(
                        quantity,
                        boxesPerBoard,
                        1
                    );

                return makeResult({
                    scenario: 1,
                    orientation: "STANDARD",
                    mode: "NO_JOINT",

                    boardWidth: BDW,
                    boardLength: BDL,

                    widthUps: WUps,
                    lengthUps: LUps,

                    boxesPerBoard,

                    piecesPerBox: 2,

                    papers,

                    reason:
                        "Sudo board width and length fit within machine limits."
                });
            }
        }
    }

    // =========================================================
    // SCENARIO 2
    // =========================================================
    //
    // Standard does not fit.
    // Alternate orientation fits.
    //
    // ABW <= 128
    // ABL <= 175
    //
    // Example:
    //
    // L=103 W=17 H=17
    //
    // ABW = 120
    // ABL = 68
    //
    // Board Width = 120 + 2 = 122
    // Board Length = 68 + 5 = 73
    // =========================================================

    if (
        ABW <= maxDeckle &&
        ABL <= maxCutting
    ) {
        const WUps =
            getUps(
                maxDeckle,
                ABW,
                TA
            );

        if (WUps >= 1) {
            /*
             * Based on your Scenario 2:
             * use ONE ABL unit.
             *
             * Do not multiply ABL by LUps here.
             */
            const LUps = 1;

            const BDW =
                (WUps * ABW) + TA;

            const BDL =
                ABL + GA;

            if (
                BDW <= maxDeckle &&
                BDL <= maxCutting
            ) {
                const boxesPerBoard =
                    WUps;

                const papers =
                    calculatePapers(
                        quantity,
                        boxesPerBoard,
                        1
                    );

                return makeResult({
                    scenario: 2,
                    orientation: "ALTERNATE",
                    mode: "JOINT_POSSIBLE",

                    boardWidth: BDW,
                    boardLength: BDL,

                    widthUps: WUps,
                    lengthUps: LUps,

                    boxesPerBoard,

                    piecesPerBox: 1,

                    papers,

                    reason:
                        "Standard orientation does not fit; alternate orientation fits."
                });
            }
        }
    }

    // =========================================================
    // SCENARIO 3
    // =========================================================
    //
    // Both standard and alternate exceed limits.
    //
    // Check whether the SUDO dimensions can be accommodated
    // by multiple ups / multiple sections.
    //
    // Example:
    //
    // L=38 W=38 H=12
    //
    // SBW = 50
    // SBL = 152
    //
    // WUps = floor(128 / 50) = 2
    //
    // Board Width:
    // 2 × 50 + 2 = 102
    //
    // Board Length:
    // 152 + 5 = 157
    //
    // Boxes per board = 2
    //
    // QTY 100:
    // Papers = 100 / 2 = 50
    // =========================================================

    if (
        SBW <= maxDeckle &&
        SBL <= maxCutting
    ) {
        /*
         * Normally Scenario 1 would already have
         * returned above.
         *
         * This block is here only as a safe fallback.
         */
    }

    // Multiple boxes across deckle
    const multipleWidthUps =
        getUps(
            maxDeckle,
            SBW,
            TA
        );

    // Use ONE cutting length when the sudo length
    // itself fits the cutting limit.
    if (
        multipleWidthUps >= 2 &&
        SBL <= maxCutting
    ) {
        const BDW =
            (multipleWidthUps * SBW) + TA;

        const BDL =
            SBL + GA;

        if (
            BDW <= maxDeckle &&
            BDL <= maxCutting
        ) {
            const boxesPerBoard =
                multipleWidthUps;

            const papers =
                calculatePapers(
                    quantity,
                    boxesPerBoard,
                    1
                );

            return makeResult({
                scenario: 3,
                orientation: "STANDARD_MULTIPLE",
                mode: "MULTIPLE_BOX",

                boardWidth: BDW,
                boardLength: BDL,

                widthUps: multipleWidthUps,
                lengthUps: 1,

                boxesPerBoard,

                piecesPerBox: 1,

                papers,

                reason:
                    "Multiple boxes fit across the deckle width."
            });
        }
    }

    // =========================================================
    // SCENARIO 4
    // =========================================================
    //
    // Alternate orientation allows multiple boxes
    // in the cutting direction.
    //
    // Example:
    //
    // L=103 W=15 H=15
    //
    // ABW = 118
    // ABW + TA = 120
    //
    // ABL = 60
    //
    // 2 × 60 + 5 = 125
    //
    // Board = 120 × 125
    //
    // QTY=100
    // Papers=50
    // =========================================================

    if (
        ABW <= maxDeckle &&
        ABL <= maxCutting
    ) {
        const widthUps = getUps(
            maxDeckle,
            ABW,
            TA
        );

        /*
         * For Scenario 4 we intentionally allow
         * multiple cutting sections.
         */
        const lengthUps = Math.floor(
            (maxCutting - GA) / ABL
        );

        if (
            widthUps >= 1 &&
            lengthUps >= 2
        ) {
            const BDW =
                (widthUps * ABW) + TA;

            const BDL =
                (lengthUps * ABL) + GA;

            if (
                BDW <= maxDeckle &&
                BDL <= maxCutting
            ) {
                const boxesPerBoard =
                    widthUps * lengthUps;

                const papers =
                    calculatePapers(
                        quantity,
                        boxesPerBoard,
                        1
                    );

                return makeResult({
                    scenario: 4,
                    orientation: "ALTERNATE_MULTIPLE",
                    mode: "MULTIPLE_BOX",

                    boardWidth: BDW,
                    boardLength: BDL,

                    widthUps,
                    lengthUps,

                    boxesPerBoard,

                    piecesPerBox: 1,

                    papers,

                    reason:
                        "Alternate orientation is used with multiple cutting sections."
                });
            }
        }
    }

    // =========================================================
    // SCENARIO 3 / SPLIT BOARD
    // =========================================================
    //
    // If sudo dimensions exceed machine size, check
    // whether splitting is possible.
    // =========================================================

    const canSplitWidth =
        SBW > maxDeckle &&
        SBW <= (2 * maxDeckle);

    const canSplitLength =
        SBL > maxCutting &&
        SBL <= (2 * maxCutting);

    if (
        canSplitWidth ||
        canSplitLength
    ) {
        let boardWidth;
        let boardLength;

        let widthPieces = 1;
        let lengthPieces = 1;

        // -----------------------------------------
        // Split width
        // -----------------------------------------

        if (canSplitWidth) {
            widthPieces = 2;

            boardWidth =
                (SBW / 2) + TA;
        } else {
            boardWidth =
                SBW + TA;
        }

        // -----------------------------------------
        // Split length
        // -----------------------------------------

        if (canSplitLength) {
            lengthPieces = 2;

            boardLength =
                (SBL / 2) + GA;
        } else {
            boardLength =
                SBL + GA;
        }

        const piecesPerBox =
            widthPieces * lengthPieces;

        if (
            boardWidth <= maxDeckle &&
            boardLength <= maxCutting
        ) {
            const papers =
                calculatePapers(
                    quantity,
                    1,
                    piecesPerBox
                );

            return makeResult({
                scenario: 3,

                orientation: "STANDARD_SPLIT",

                mode: "MULTI_BOARD",

                boardWidth,
                boardLength,

                widthUps: 1,
                lengthUps: 1,

                boxesPerBoard: 1,

                piecesPerBox,

                papers,

                reason:
                    "The box requires multiple board sections because the standard blank exceeds machine limits."
            });
        }
    }

    // =========================================================
    // SCENARIO 5
    // =========================================================
    //
    // Multiple boards joined to make one box.
    //
    // Example:
    //
    // L=104 W=51 H=51
    //
    // SBW = 102
    //
    // Board Width:
    // 102 + 2 = 104
    //
    // Board Length:
    // (104 + 51) + 5 + 2
    // = 162
    //
    // 4 board pieces per box
    //
    // QTY=100
    // Papers=400
    // =========================================================

    if (
        (L + W) < maxCutting
    ) {
        const BDW =
            SBW + TA;

        const BDL =
            (L + W) + GA + TA;

        if (
            BDW <= maxDeckle &&
            BDL <= maxCutting
        ) {
            /*
             * According to your Scenario 5 example,
             * one box needs 4 board pieces.
             */
            const piecesPerBox = 4;

            const papers =
                quantity *
                piecesPerBox;

            return makeResult({
                scenario: 5,

                orientation: "STANDARD_JOINT",

                mode: "JOINT",

                boardWidth: BDW,
                boardLength: BDL,

                widthUps: 1,
                lengthUps: 1,

                boxesPerBoard: 1,

                piecesPerBox,

                papers,

                reason:
                    "Multiple board pieces are joined to form one box."
            });
        }
    }

    // =========================================================
    // NO SOLUTION
    // =========================================================

    return {
        success: false,

        error:
            "Cannot calculate a board size within the configured machine limits.",

        box: {
            length: L,
            width: W,
            height: H
        },

        sudoSize: {
            width: round(SBW),
            length: round(SBL)
        },

        alternateSize: {
            width: round(ABW),
            length: round(ABL)
        },

        machineLimits: {
            maxDeckle,
            maxCutting
        }
    };
}

module.exports = {
    calculateBoardSize
};
