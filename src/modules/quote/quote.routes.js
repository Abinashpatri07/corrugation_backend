const express = require('express');
const router = express.Router();
const quoteController = require('./quote.controller');

router.post('/calculate-board', quoteController.calculateBoard);
router.post('/', quoteController.createQuote);
router.get('/', quoteController.getAllQuotes);
router.get('/:id', quoteController.getQuoteById);

module.exports = router;
