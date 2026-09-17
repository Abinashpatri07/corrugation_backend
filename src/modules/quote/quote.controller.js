const quoteService = require('./quote.service');

async function calculateBoard(req, res, next) {
    try {
        const { length, width, height, qty, ply, gsm, fluteFactor } = req.body;
        
        if (!length || !width || !height) {
            return res.status(400).json({
                success: false,
                message: 'Length, width, and height are required.'
            });
        }

        const quantity = Number(qty) || 1;
        const plyType = Number(ply?.replace(/\D/g, '')) || 3;

        const parsedGsm = Number(gsm) || 145;
        const parsedFlute = Number(fluteFactor) || 1.5;

        const result = quoteService.calculateBoardSize(length, width, height, quantity, plyType, parsedGsm, parsedFlute);
        
        if (result.error) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Board size calculated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    calculateBoard
};
