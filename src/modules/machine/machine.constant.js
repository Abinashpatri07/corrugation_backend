// =====================================================
// MACHINE CONSTANTS
// =====================================================
// This file contains fixed values used by the Machine
// module.
//
// Keeping these values here avoids writing strings such
// as "ACTIVE" and "INACTIVE" repeatedly in different files.
// =====================================================


// -----------------------------------------------------
// Machine status values
// These values must match the CHECK constraint in the
// machine table.
// -----------------------------------------------------

const MACHINE_STATUS = Object.freeze({

    ACTIVE: 'ACTIVE',

    INACTIVE: 'INACTIVE',

    UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',

    SCRAPPED: 'SCRAPPED'

});


// -----------------------------------------------------
// Service contract status values
// These values must match the CHECK constraint in the
// machine_service_contract table.
// -----------------------------------------------------

const SERVICE_CONTRACT_STATUS = Object.freeze({

    ACTIVE: 'ACTIVE',

    EXPIRED: 'EXPIRED',

    CANCELLED: 'CANCELLED',

    INACTIVE: 'INACTIVE'

});


module.exports = {

    MACHINE_STATUS,

    SERVICE_CONTRACT_STATUS

};