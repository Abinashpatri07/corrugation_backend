// =====================================================
// MACHINE ROUTES
// =====================================================

const express = require('express');

const router = express.Router();


// =====================================================
// CONTROLLERS
// =====================================================

const machineController =
    require('./machine.controller');


// =====================================================
// MAINTENANCE ROUTES
// =====================================================

const machineMaintenanceRoutes =
    require('./machineMaintenance.routes');


// =====================================================
// MACHINE MAINTENANCE
// =====================================================

router.use(
    '/',
    machineMaintenanceRoutes
);


// =====================================================
// CREATE MACHINE
// POST /api/v1/machines
// =====================================================

router.post(
    '/',
    machineController.createMachine
);


// =====================================================
// GET ALL MACHINES
// GET /api/v1/machines
// =====================================================

router.get(
    '/',
    machineController.getAllMachines
);


// =====================================================
// GET MACHINE BY ID
// GET /api/v1/machines/:id
// =====================================================

router.get(
    '/:id',
    machineController.getMachine
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;