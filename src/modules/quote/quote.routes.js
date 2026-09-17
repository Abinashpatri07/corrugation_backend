const express = require('express');
const router = express.Router();
const quoteController = require('./quote.controller');

router.post('/calculate-board', quoteController.calculateBoard);

module.exports = router;
