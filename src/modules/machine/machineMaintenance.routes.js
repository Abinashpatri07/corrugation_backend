// =====================================================
// MACHINE MAINTENANCE ROUTES
// =====================================================

const express =
    require('express');

const router =
    express.Router();


const controller =
    require('./machineMaintenance.controller');


// =====================================================
// GET MACHINE MAINTENANCE
// =====================================================

router.get(
    '/:id/maintenance',
    controller.getMachineMaintenance
);


module.exports = router;