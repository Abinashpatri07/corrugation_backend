// =====================================================
// MACHINE VALIDATION
// =====================================================
// This file validates the request coming from the
// frontend before data is inserted into PostgreSQL.
// =====================================================

const {
    MACHINE_STATUS,
    SERVICE_CONTRACT_STATUS
} = require('./machine.constant');


// -----------------------------------------------------
// Check whether a value is empty
// -----------------------------------------------------

const isBlank = (value) => {

    return (
        value === undefined ||
        value === null ||
        String(value).trim() === ''
    );

};


// -----------------------------------------------------
// Validate number
// -----------------------------------------------------

const isValidNumber = (value) => {

    if (isBlank(value)) {
        return true;
    }

    return Number.isFinite(
        Number(value)
    );

};


// -----------------------------------------------------
// Validate integer
// -----------------------------------------------------

const isValidInteger = (value) => {

    if (isBlank(value)) {
        return true;
    }

    return Number.isInteger(
        Number(value)
    );

};


// -----------------------------------------------------
// Validate date
//
// HTML <input type="date"> sends:
//
// YYYY-MM-DD
//
// Example:
//
// 2026-09-28
// -----------------------------------------------------

const isValidDate = (value) => {

    if (isBlank(value)) {
        return true;
    }

    return /^\d{4}-\d{2}-\d{2}$/.test(
        String(value)
    );

};


// =====================================================
// CREATE MACHINE VALIDATION
// =====================================================

const validateCreateMachine = (body) => {

    const errors = [];


    // -------------------------------------------------
    // Check request body
    // -------------------------------------------------

    if (
        !body ||
        typeof body !== 'object'
    ) {

        return {

            valid: false,

            errors: [
                'Request body is required'
            ]

        };

    }


    // -------------------------------------------------
    // Read nested objects
    // -------------------------------------------------

    const machine =
        body.machine || body;

    const technical =
        body.technical_spec || {};

    const operational =
        body.operational_spec || {};

    const service =
        body.service_contract || {};


    // =================================================
    // MACHINE
    // =================================================

    // Machine Code
    if (isBlank(machine.machine_code)) {

        errors.push(
            'machine_code is required'
        );

    } else if (
        String(machine.machine_code).length > 30
    ) {

        errors.push(
            'machine_code cannot exceed 30 characters'
        );

    }


    // Machine Name
    if (isBlank(machine.machine_name)) {

        errors.push(
            'machine_name is required'
        );

    } else if (
        String(machine.machine_name).length > 100
    ) {

        errors.push(
            'machine_name cannot exceed 100 characters'
        );

    }


    // Machine Type
    if (isBlank(machine.machine_type)) {

        errors.push(
            'machine_type is required'
        );

    }


    // Location
    if (isBlank(machine.location)) {

        errors.push(
            'location is required'
        );

    }


    // Description
    if (
        !isBlank(machine.description) &&
        String(machine.description).length > 500
    ) {

        errors.push(
            'description cannot exceed 500 characters'
        );

    }


    // -------------------------------------------------
    // Machine status
    // -------------------------------------------------

    let machineStatus;

    if (
        typeof machine.machine_status === 'boolean'
    ) {

        machineStatus =
            machine.machine_status
                ? 'ACTIVE'
                : 'INACTIVE';

    } else if (
        isBlank(machine.machine_status)
    ) {

        machineStatus = 'ACTIVE';

    } else {

        machineStatus =
            String(
                machine.machine_status
            )
                .trim()
                .toUpperCase();

    }


    if (
        !Object.values(MACHINE_STATUS)
            .includes(machineStatus)
    ) {

        errors.push(
            'Invalid machine_status'
        );

    }


    // =================================================
    // DATES
    // =================================================

    const dateFields = [

        'manufacturing_date',

        'purchasing_date',

        'purchase_date',

        'installation_date'

    ];


    dateFields.forEach(
        (field) => {

            if (
                !isValidDate(
                    machine[field]
                )
            ) {

                errors.push(
                    `${field} must be in YYYY-MM-DD format`
                );

            }

        }
    );


    // =================================================
    // PURCHASING PRICE
    // =================================================

    if (
        !isValidNumber(
            machine.purchasing_price ??
            machine.purchase_price
        )
    ) {

        errors.push(
            'purchasing_price must be a valid number'
        );

    }


    // =================================================
    // WARRANTY
    // =================================================

    if (
        !isValidInteger(
            machine.warranty_period ??
            machine.warranty_period_months
        )
    ) {

        errors.push(
            'warranty_period must be a valid integer'
        );

    }


    // =================================================
    // TECHNICAL SPECIFICATION
    // =================================================

    const technicalNumbers = [

        'power',

        'voltage',

        'speed',

        'weight',

        'capacity',

        'dimension_l',

        'dimension_w',

        'dimension_h'

    ];


    technicalNumbers.forEach(
        (field) => {

            if (
                !isValidNumber(
                    technical[field]
                )
            ) {

                errors.push(
                    `${field} must be a valid number`
                );

            }

        }
    );


    // Dimensions are required by your frontend.
    if (
        isBlank(
            technical.dimension_l
        )
    ) {

        errors.push(
            'dimension_l is required'
        );

    }


    if (
        isBlank(
            technical.dimension_w
        )
    ) {

        errors.push(
            'dimension_w is required'
        );

    }


    if (
        isBlank(
            technical.dimension_h
        )
    ) {

        errors.push(
            'dimension_h is required'
        );

    }


    // =================================================
    // OPERATIONAL SPECIFICATION
    // =================================================

    const operationalNumbers = [

        'monthly_working_days',

        'weekly_off_days',

        'working_days',

        'operational_shifts',

        'operator_count'

    ];


    operationalNumbers.forEach(
        (field) => {

            if (
                !isValidInteger(
                    operational[field]
                )
            ) {

                errors.push(
                    `${field} must be an integer`
                );

            }

        }
    );


    // =================================================
    // SERVICE CONTRACT
    // =================================================

    if (
        !isBlank(
            service.service_contract_status
        )
    ) {

        const status =
            String(
                service.service_contract_status
            )
                .trim()
                .toUpperCase();


        if (
            !Object.values(
                SERVICE_CONTRACT_STATUS
            ).includes(status)
        ) {

            errors.push(
                'Invalid service_contract_status'
            );

        }

    }


    if (
        !isValidInteger(
            service.service_frequency_days
        )
    ) {

        errors.push(
            'service_frequency_days must be an integer'
        );

    }


    return {

        valid:
            errors.length === 0,

        errors

    };

};


module.exports = {

    validateCreateMachine,

    isBlank,

    isValidNumber,

    isValidInteger,

    isValidDate

};