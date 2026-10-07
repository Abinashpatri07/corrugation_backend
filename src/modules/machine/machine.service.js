// =====================================================
// MACHINE SERVICE
// =====================================================

const pool =
    require('../../config/database');

const repository =
    require('./machine.repository');

const {
    validateCreateMachine,
    isBlank
} =
    require('./machine.validation');

const {
    normalizeMachineCode
} =
    require('./machine-code');


// =====================================================
// NORMALIZE MACHINE STATUS
// =====================================================

const normalizeMachineStatus = (
    value
) => {

    // Frontend sends true / false.
    if (
        typeof value === 'boolean'
    ) {

        return value
            ? 'ACTIVE'
            : 'INACTIVE';

    }


    // If nothing is provided,
    // default to ACTIVE.
    if (
        isBlank(value)
    ) {

        return 'ACTIVE';

    }


    return String(value)
        .trim()
        .toUpperCase();

};


// =====================================================
// NORMALIZE SERVICE CONTRACT STATUS
// =====================================================

const normalizeServiceContractStatus = (
    value
) => {

    if (
        isBlank(value)
    ) {

        return 'ACTIVE';

    }


    return String(value)
        .trim()
        .toUpperCase();

};


// =====================================================
// CONVERT FRONTEND DATA
// TO BACKEND/DATABASE DATA
// =====================================================

const normalizePayload = (
    body,
    userId = null
) => {

    // -------------------------------------------------
    // Read sections sent from frontend
    // -------------------------------------------------

    const machine =
        body.machine || {};

    const technical =
        body.technical_spec || {};

    const operational =
        body.operational_spec || {};

    const service =
        body.service_contract || {};

    const maintenance =
        body.maintenance || {};


    return {

        // =============================================
        // MACHINE
        // =============================================

        machine: {

            machine_code:
                normalizeMachineCode(
                    machine.machine_code
                ),

            machine_name:
                String(
                    machine.machine_name || ''
                ).trim(),

            machine_category:
                machine.machine_category ||
                null,

            machine_type:
                String(
                    machine.machine_type || ''
                ).trim(),

            department:
                machine.department ||
                null,

            brand:
                machine.brand ||
                null,

            model:
                machine.model ||
                null,

            serial_number:
                isBlank(
                    machine.serial_number
                )
                    ? null
                    : String(
                        machine.serial_number
                    ).trim(),

            location:
                String(
                    machine.location || ''
                ).trim(),

            manufacturing_date:
                machine.manufacturing_date ||
                null,

            purchase_date:
                machine.purchasing_date ||
                machine.purchase_date ||
                null,

            purchase_price:
                isBlank(
                    machine.purchasing_price
                )
                    ? null
                    : Number(
                        machine.purchasing_price
                    ),

            installation_date:
                machine.installation_date ||
                null,

            warranty_period_months:
                isBlank(
                    machine.warranty_period
                )
                    ? null
                    : Number(
                        machine.warranty_period
                    ),

            description:
                isBlank(
                    machine.description
                )
                    ? null
                    : String(
                        machine.description
                    ).trim(),

            machine_status:
                normalizeMachineStatus(
                    machine.machine_status
                ),

            created_by:
                userId ||
                machine.created_by ||
                null

        },


        // =============================================
        // TECHNICAL SPECIFICATION
        // =============================================

        technical_spec: {

            power:
                isBlank(
                    technical.power
                )
                    ? null
                    : Number(
                        technical.power
                    ),

            power_unit:
                technical.power_unit ||
                'KW',

            voltage:
                isBlank(
                    technical.voltage
                )
                    ? null
                    : Number(
                        technical.voltage
                    ),

            voltage_unit:
                technical.voltage_unit ||
                'V',

            speed:
                isBlank(
                    technical.speed
                )
                    ? null
                    : Number(
                        technical.speed
                    ),

            speed_unit:
                technical.speed_unit ||
                'RPM',

            weight:
                isBlank(
                    technical.weight
                )
                    ? null
                    : Number(
                        technical.weight
                    ),

            weight_unit:
                technical.weight_unit ||
                'KG',

            capacity:
                isBlank(
                    technical.capacity
                )
                    ? null
                    : Number(
                        technical.capacity
                    ),

            capacity_unit:
                technical.capacity_unit ||
                null,

            dimension_l:
                Number(
                    technical.dimension_l
                ),

            dimension_w:
                Number(
                    technical.dimension_w
                ),

            dimension_h:
                Number(
                    technical.dimension_h
                ),

            dimension_unit:
                technical.dimension_unit ||
                null,

            created_by:
                userId ||
                null

        },


        // =============================================
        // OPERATIONAL SPECIFICATION
        // =============================================

        operational_spec: {

            monthly_working_days:
                isBlank(
                    operational.monthly_working_days
                )
                    ? null
                    : Number(
                        operational.monthly_working_days
                    ),

            weekly_off_days:
                isBlank(
                    operational.weekly_off_days
                )
                    ? null
                    : Number(
                        operational.weekly_off_days
                    ),

            working_days:
                isBlank(
                    operational.working_days
                )
                    ? null
                    : Number(
                        operational.working_days
                    ),

            operational_shifts:
                isBlank(
                    operational.operational_shifts
                )
                    ? null
                    : Number(
                        operational.operational_shifts
                    ),

            operator_count:
                isBlank(
                    operational.operator_count
                )
                    ? null
                    : Number(
                        operational.operator_count
                    ),

            remarks:
                operational.remarks ||
                null,

            created_by:
                userId ||
                null

        },


        // =============================================
        // SERVICE CONTRACT
        // =============================================

        service_contract: {

            vendor_id:
                isBlank(
                    service.vendor_id
                )
                    ? null
                    : service.vendor_id,

            contract_number:
                service.contract_number ||
                null,

            contract_start_date:
                service.contract_start_date ||
                null,

            contract_end_date:
                service.contract_end_date ||
                null,

            contact_person:
                service.contact_person ||
                null,

            designation:
                service.designation ||
                null,

            mobile_number:
                service.mobile_number ||
                null,

            email:
                service.email ||
                null,

            service_contract_status:
                normalizeServiceContractStatus(
                    service.service_contract_status
                ),

            service_frequency_days:
                isBlank(
                    service.service_frequency_days
                )
                    ? null
                    : Number(
                        service.service_frequency_days
                    ),

            remarks:
                service.remarks ||
                null,

            created_by:
                userId ||
                null

        },


        // =============================================
        // MAINTENANCE
        // =============================================

        maintenance: {

            maint_installation_date:
                maintenance.maint_installation_date ||
                null,

            last_servicing_date:
                maintenance.last_servicing_date ||
                null,

            frequency:
                isBlank(
                    maintenance.frequency
                )
                    ? null
                    : Number(
                        maintenance.frequency
                    ),

            downtime:
                isBlank(
                    maintenance.downtime
                )
                    ? null
                    : Number(
                        maintenance.downtime
                    ),

            downtime_unit:
                maintenance.downtime_unit ||
                'Hours'

        }

    };

};


// =====================================================
// CREATE MACHINE
// =====================================================

const createMachine = async (
    body,
    userId = null
) => {

    // -------------------------------------------------
    // STEP 1
    // Validate request
    // -------------------------------------------------

    const validation =
        validateCreateMachine(
            body
        );


    if (
        !validation.valid
    ) {

        const error =
            new Error(
                'Validation failed'
            );

        error.statusCode = 400;

        error.details =
            validation.errors;

        throw error;

    }


    // -------------------------------------------------
    // STEP 2
    // Convert frontend data
    // -------------------------------------------------

    const payload =
        normalizePayload(
            body,
            userId
        );


    // -------------------------------------------------
    // STEP 3
    // Get database connection
    // -------------------------------------------------

    const client =
        await pool.connect();


    try {

        // =============================================
        // START TRANSACTION
        // =============================================

        await client.query(
            'BEGIN'
        );


        // =============================================
        // CHECK MACHINE CODE
        // =============================================

        const existingMachine =
            await repository.findMachineByCode(
                client,
                payload.machine.machine_code
            );


        if (
            existingMachine
        ) {

            const error =
                new Error(
                    'Machine code already exists'
                );

            error.statusCode = 409;

            throw error;

        }


        // =============================================
        // CHECK SERIAL NUMBER
        // =============================================

        const existingSerial =
            await repository.findMachineBySerialNumber(
                client,
                payload.machine.serial_number
            );


        if (
            existingSerial
        ) {

            const error =
                new Error(
                    'Serial number already exists'
                );

            error.statusCode = 409;

            throw error;

        }


        // =============================================
        // CHECK VENDOR
        // =============================================

        if (
            payload.service_contract.vendor_id
        ) {

            const vendor =
                await repository.findVendorById(
                    client,
                    payload.service_contract.vendor_id
                );


            if (
                !vendor
            ) {

                const error =
                    new Error(
                        'Selected vendor does not exist'
                    );

                error.statusCode = 400;

                throw error;

            }

        }


        // =============================================
        // CREATE MACHINE
        // =============================================

        const machine =
            await repository.createMachine(
                client,
                payload.machine
            );


        // =============================================
        // CREATE TECHNICAL SPECIFICATION
        // =============================================

        const technicalSpec =
            await repository.createTechnicalSpecification(
                client,
                machine.machine_id,
                payload.technical_spec
            );


        // =============================================
        // CREATE OPERATIONAL SPECIFICATION
        // =============================================

        const operationalSpec =
            await repository.createOperationalSpecification(
                client,
                machine.machine_id,
                payload.operational_spec
            );


        // =============================================
        // CREATE SERVICE CONTRACT
        // =============================================

        const serviceContract =
            await repository.createServiceContract(
                client,
                machine.machine_id,
                payload.service_contract
            );


        // =============================================
        // EVERYTHING SUCCESSFUL
        // COMMIT TRANSACTION
        // =============================================

        await client.query(
            'COMMIT'
        );


        // =============================================
        // RETURN ALL CREATED RECORDS
        // =============================================

        return {

            machine,

            technical_spec:
                technicalSpec,

            operational_spec:
                operationalSpec,

            service_contract:
                serviceContract,

            maintenance:
                payload.maintenance

        };


    } catch (error) {

        // =============================================
        // SOMETHING FAILED
        // ROLLBACK EVERYTHING
        // =============================================

        await client.query(
            'ROLLBACK'
        );

        throw error;


    } finally {

        // =============================================
        // RELEASE CONNECTION
        // =============================================

        client.release();

    }

};


// =====================================================
// GET MACHINE BY ID
// =====================================================

const getMachineById = async (
    machineId
) => {

    const id =
        Number(machineId);


    if (
        !Number.isInteger(id)
    ) {

        const error =
            new Error(
                'Invalid machine id'
            );

        error.statusCode = 400;

        throw error;

    }


    const client =
        await pool.connect();


    try {

        return await repository.getMachineById(
            client,
            id
        );

    } finally {

        client.release();

    }

};


/*
=========================================================
GET ALL MACHINES
=========================================================
*/

const getAllMachines = async () => {

    const machines =
        await repository.getAllMachines();


    return machines.map((machine) => {

        /*
        -----------------------------------------------
        Convert database status to UI status
        -----------------------------------------------
        */

        let status = 'Running';


        if (
            machine.machine_status ===
            'INACTIVE'
        ) {

            status = 'Idle';

        }


        if (
            machine.machine_status ===
            'UNDER_MAINTENANCE'
        ) {

            status = 'Maintenance';

        }


        if (
            machine.machine_status ===
            'SCRAPPED'
        ) {

            status = 'Down';

        }


        /*
        -----------------------------------------------
        Capacity
        -----------------------------------------------
        */

        let capacity = '-';


        if (
            machine.capacity !== null &&
            machine.capacity !== undefined
        ) {

            capacity =
                `${machine.capacity} ${machine.capacity_unit || ''}`.trim();

        }


        /*
        -----------------------------------------------
        Next Maintenance
        -----------------------------------------------
        */

        let nextMaintenance = '-';


        if (
            machine.next_maintenance_date
        ) {

            const date =
                new Date(
                    machine.next_maintenance_date
                );


            nextMaintenance =
                date.toLocaleDateString(
                    'en-IN',
                    {

                        day: '2-digit',

                        month: 'short',

                        year: 'numeric'

                    }
                );

        }


        /*
        -----------------------------------------------
        Return frontend-friendly object
        -----------------------------------------------
        */

        return {

            id:
                machine.machine_id,

            machineCode:
                machine.machine_code,

            machineName:
                machine.machine_name,

            createdAt:
                machine.created_at,

            location:
                machine.location ||
                '-',

            machineType:
                machine.machine_type ||
                '-',

            brand:
                machine.brand ||
                '-',

            model:
                machine.model ||
                '-',

            capacity,

            /*
            OEE is not currently stored directly
            in the machine table.
            */

            oee:
                null,

            nextMaintenance,

            status

        };

    });

};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    createMachine,

    getMachineById,

    getAllMachines

};