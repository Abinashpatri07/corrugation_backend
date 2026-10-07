// =====================================================
// MACHINE UTILIZATION ROUTES
// =====================================================

const express =
    require('express');

const router =
    express.Router();

const controller =
    require('./machineUtilization.controller');


// =====================================================
// GET MACHINE UTILIZATION
// =====================================================

// GET
// /api/v1/machines/:machineId/utilization
//
// Optional:
// ?range=last_week
// ?range=last_month

router.get(
    '/:machineId/utilization',
    controller.getMachineUtilization
);


module.exports = router;