const quoteService = require('./quote.service');

async function calculateBoard(req, res, next) {
    try {
        const { length, width, height, qty, ply, topGsm, linerGsm, fluteGsm, fluteFactor, paperType } = req.body;
        
        if (!length || !width || !height) {
            return res.status(400).json({
                success: false,
                message: 'Length, width, and height are required.'
            });
        }

        const quantity = Number(qty) || 1;
        const plyType = Number(ply?.replace(/\D/g, '')) || 3;

        const parsedTopGsm = Number(topGsm);
        const parsedLinerGsm = Number(linerGsm);
        const parsedFluteGsm = Number(fluteGsm);

        if (!parsedTopGsm || !parsedLinerGsm || !parsedFluteGsm) {
            return res.status(400).json({
                success: false,
                message: 'Top GSM, Liner GSM, and Flute GSM are required.'
            });
        }
        const parsedFluteFactor = Number(fluteFactor) || 1.5;

        const result = quoteService.calculateBoardSize(length, width, height, quantity, plyType, parsedTopGsm, parsedLinerGsm, parsedFluteGsm, parsedFluteFactor, paperType);
        
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

async function createQuote(req, res, next) {
    try {
        const payload = req.body;
        
        if (!payload.customerId) {
            return res.status(400).json({
                success: false,
                message: 'Customer ID is required.'
            });
        }

        const result = await quoteService.createQuote(payload);
        
        return res.status(201).json({
            success: true,
            message: 'Quote created successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function getAllQuotes(req, res, next) {
    try {
        const quotes = await quoteService.getAllQuotes();
        return res.status(200).json({
            success: true,
            data: quotes
        });
    } catch (error) {
        next(error);
    }
}

async function getQuoteById(req, res, next) {
    try {
        const { id } = req.params;
        const quote = await quoteService.getQuoteById(id);
        
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: quote
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    calculateBoard,
    createQuote,
    getAllQuotes,
    getQuoteById
};
