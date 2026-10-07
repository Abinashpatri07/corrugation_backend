// =====================================================
// MACHINE REPOSITORY
// =====================================================
// Repository = Database layer.
//
// All SQL queries related to Machine are kept here.
// =====================================================

const pool =
    require('../../config/database');


// =====================================================
// FIND MACHINE BY MACHINE CODE
// =====================================================

const findMachineByCode = async (
    client,
    machineCode
) => {

    const result =
        await client.query(
            `
            SELECT
                machine_id,
                machine_code

            FROM public.machine

            WHERE machine_code = $1
            `,
            [
                machineCode
            ]
        );

    return (
        result.rows[0] ||
        null
    );

};


// =====================================================
// FIND MACHINE BY SERIAL NUMBER
// =====================================================

const findMachineBySerialNumber = async (
    client,
    serialNumber
) => {

    // Serial number is optional.
    if (
        !serialNumber
    ) {

        return null;

    }


    const result =
        await client.query(
            `
            SELECT
                machine_id,
                serial_number

            FROM public.machine

            WHERE serial_number = $1
            `,
            [
                serialNumber
            ]
        );


    return (
        result.rows[0] ||
        null
    );

};


// =====================================================
// CHECK VENDOR
// =====================================================
// Vendor is used by machine_service_contract.
// =====================================================

const findVendorById = async (
    client,
    vendorId
) => {

    if (
        vendorId === undefined ||
        vendorId === null ||
        vendorId === ''
    ) {

        return null;

    }


    const result =
        await client.query(
            `
            SELECT
                vendor_id,
                vendor_code,
                display_name,
                company_name

            FROM public.vendor

            WHERE vendor_id = $1
            `,
            [
                vendorId
            ]
        );


    return (
        result.rows[0] ||
        null
    );

};


// =====================================================
// CREATE MACHINE
// =====================================================

const createMachine = async (
    client,
    data
) => {

    const query = `

        INSERT INTO public.machine (

            machine_code,

            machine_name,

            machine_category,

            machine_type,

            department,

            brand,

            model,

            serial_number,

            location,

            manufacturing_date,

            purchase_date,

            purchase_price,

            installation_date,

            warranty_period_months,

            description,

            machine_status,

            created_by,

            created_at

        )

        VALUES (

            $1,

            $2,

            $3,

            $4,

            $5,

            $6,

            $7,

            $8,

            $9,

            $10,

            $11,

            $12,

            $13,

            $14,

            $15,

            $16,

            $17,

            CURRENT_TIMESTAMP

        )

        RETURNING *;

    `;


    const values = [

        data.machine_code,

        data.machine_name,

        data.machine_category,

        data.machine_type,

        data.department,

        data.brand,

        data.model,

        data.serial_number,

        data.location,

        data.manufacturing_date,

        data.purchase_date,

        data.purchase_price,

        data.installation_date,

        data.warranty_period_months,

        data.description,

        data.machine_status,

        data.created_by

    ];


    const result =
        await client.query(
            query,
            values
        );


    return result.rows[0];

};


// =====================================================
// CREATE TECHNICAL SPECIFICATION
// =====================================================

const createTechnicalSpecification = async (
    client,
    machineId,
    data
) => {

    const query = `

        INSERT INTO public.machine_technical_spec (

            machine_id,

            power_value,

            power_unit,

            voltage,

            voltage_unit,

            speed,

            speed_unit,

            weight,

            weight_unit,

            capacity,

            capacity_unit,

            dimension_length,

            dimension_width,

            dimension_height,

            dimension_unit,

            created_by,

            created_at

        )

        VALUES (

            $1,

            $2,

            $3,

            $4,

            $5,

            $6,

            $7,

            $8,

            $9,

            $10,

            $11,

            $12,

            $13,

            $14,

            $15,

            $16,

            CURRENT_TIMESTAMP

        )

        RETURNING *;

    `;


    const values = [

        machineId,

        data.power,

        data.power_unit,

        data.voltage,

        data.voltage_unit,

        data.speed,

        data.speed_unit,

        data.weight,

        data.weight_unit,

        data.capacity,

        data.capacity_unit,

        data.dimension_l,

        data.dimension_w,

        data.dimension_h,

        data.dimension_unit,

        data.created_by

    ];


    const result =
        await client.query(
            query,
            values
        );


    return result.rows[0];

};


// =====================================================
// CREATE OPERATIONAL SPECIFICATION
// =====================================================

const createOperationalSpecification = async (
    client,
    machineId,
    data
) => {

    const query = `

        INSERT INTO public.machine_operational_spec (

            machine_id,

            monthly_working_days,

            weekly_off_days,

            working_days,

            operational_shifts,

            operator_count,

            remarks,

            created_by,

            created_at

        )

        VALUES (

            $1,

            $2,

            $3,

            $4,

            $5,

            $6,

            $7,

            $8,

            CURRENT_TIMESTAMP

        )

        RETURNING *;

    `;


    const values = [

        machineId,

        data.monthly_working_days,

        data.weekly_off_days,

        data.working_days,

        data.operational_shifts,

        data.operator_count,

        data.remarks,

        data.created_by

    ];


    const result =
        await client.query(
            query,
            values
        );


    return result.rows[0];

};


// =====================================================
// CREATE SERVICE CONTRACT
// =====================================================

const createServiceContract = async (
    client,
    machineId,
    data
) => {

    const query = `

        INSERT INTO public.machine_service_contract (

            machine_id,

            vendor_id,

            contract_number,

            contract_start_date,

            contract_end_date,

            contact_person,

            designation,

            mobile_number,

            email,

            service_contract_status,

            service_frequency_days,

            remarks,

            created_by,

            created_at

        )

        VALUES (

            $1,

            $2,

            $3,

            $4,

            $5,

            $6,

            $7,

            $8,

            $9,

            $10,

            $11,

            $12,

            $13,

            CURRENT_TIMESTAMP

        )

        RETURNING *;

    `;


    const values = [

        machineId,

        data.vendor_id,

        data.contract_number,

        data.contract_start_date,

        data.contract_end_date,

        data.contact_person,

        data.designation,

        data.mobile_number,

        data.email,

        data.service_contract_status,

        data.service_frequency_days,

        data.remarks,

        data.created_by

    ];


    const result =
        await client.query(
            query,
            values
        );


    return result.rows[0];

};

// =====================================================
// GET MACHINE BY ID
// =====================================================

// =====================================================
// GET MACHINE BY ID
// =====================================================

const getMachineById = async (
    client,
    machineId
) => {

    const result =
        await client.query(
            `
            SELECT

                m.*,

                row_to_json(ts)
                    AS technical_spec,

                row_to_json(os)
                    AS operational_spec,

                CASE

                    WHEN sc.machine_id IS NOT NULL

                    THEN

                        to_jsonb(sc)

                        ||

                        jsonb_build_object(

                            'vendor_name',

                            COALESCE(
                                v.display_name,
                                v.company_name
                            ),

                            'vendor_code',

                            v.vendor_code

                        )

                    ELSE

                        NULL

                END
                    AS service_contract

            FROM public.machine m

            LEFT JOIN
                public.machine_technical_spec ts

                ON ts.machine_id =
                    m.machine_id

            LEFT JOIN
                public.machine_operational_spec os

                ON os.machine_id =
                    m.machine_id

            LEFT JOIN
                public.machine_service_contract sc

                ON sc.machine_id =
                    m.machine_id

            LEFT JOIN
                public.vendor v

                ON v.vendor_id =
                    sc.vendor_id

            WHERE
                CAST(m.machine_id AS TEXT) =
                CAST($1 AS TEXT)

            LIMIT 1
            `,
            [
                machineId
            ]
        );


    console.log(
        'GET MACHINE BY ID RESULT:',
        {
            requestedMachineId: machineId,
            rowCount: result.rows.length,
            machine:
                result.rows[0] || null
        }
    );


    return (
        result.rows[0] ||
        null
    );

};

/*
=========================================================
GET ALL MACHINES
=========================================================
*/

const getAllMachines = async () => {

    const query = `
        SELECT
            m.machine_id,
            m.machine_code,
            m.machine_name,
            m.machine_type,
            m.brand,
            m.model,
            m.location,
            m.machine_status,
            m.created_at,

            mts.capacity,
            mts.capacity_unit,

            mm.next_maintenance_date

        FROM public.machine m

        LEFT JOIN public.machine_technical_spec mts
            ON mts.machine_id = m.machine_id

        LEFT JOIN LATERAL (

            SELECT
                next_maintenance_date

            FROM public.machine_maintenance

            WHERE machine_id = m.machine_id

              AND next_maintenance_date IS NOT NULL

            ORDER BY next_maintenance_date ASC

            LIMIT 1

        ) mm ON TRUE

        ORDER BY m.machine_id ASC
    `;

    const result = await pool.query(query);

    return result.rows;
};

// =====================================================
// CREATE MACHINE MAINTENANCE
// =====================================================

const createMaintenance = async (
    client,
    machineId,
    data
) => {

    // -------------------------------------------------
    // Generate maintenance number
    // -------------------------------------------------

    const maintenanceNumber =
        `MNT-${machineId}-${Date.now()}`;


    // -------------------------------------------------
    // Determine maintenance date
    //
    // Last servicing date is treated as the
    // actual maintenance date.
    // If unavailable, use maintenance installation date.
    // -------------------------------------------------

    const maintenanceDate =
        data.last_servicing_date ||
        data.maint_installation_date ||
        null;


    // -------------------------------------------------
    // Determine status
    // -------------------------------------------------

    const maintenanceStatus =
        data.last_servicing_date
            ? 'COMPLETED'
            : 'SCHEDULED';


    // -------------------------------------------------
    // Calculate next maintenance date
    // -------------------------------------------------

    let nextMaintenanceDate = null;


    if (
        maintenanceDate &&
        data.frequency &&
        Number(data.frequency) > 0
    ) {

        const date =
            new Date(maintenanceDate);


        date.setDate(
            date.getDate() +
            Number(data.frequency)
        );


        nextMaintenanceDate =
            date.toISOString().split('T')[0];

    }


    // -------------------------------------------------
    // Insert maintenance record
    // -------------------------------------------------

    const query = `

        INSERT INTO public.machine_maintenance (

            machine_id,

            maintenance_number,

            maintenance_type,

            maintenance_status,

            maintenance_date,

            next_maintenance_date,

            service_contract_id,

            vendor_id,

            technician_name,

            technician_phone,

            frequency,

            estimated_duration,

            duration_unit,

            maintenance_cost,

            work_performed,

            description,

            remarks

        )

        VALUES (

            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13,
            $14,
            $15,
            $16,
            $17,

        )

        RETURNING *;

    `;


    const values = [

        machineId,

        maintenanceNumber,

        'PREVENTIVE',

        maintenanceStatus,

        maintenanceDate,

        nextMaintenanceDate,

        data.service_contract_id ||
        null,

        data.vendor_id ||
        null,

        data.contact_person ||
        null,

        data.mobile_number ||
        null,

        data.frequency
            ? String(data.frequency)
            : null,

        data.downtime ||
        null,

        (
            data.downtime_unit ||
            'Hours'
        ).toUpperCase(),

        null,

        null,

        null,

        null

    ];


    const result =
        await client.query(
            query,
            values
        );


    return result.rows[0];

};

module.exports = {

    findMachineByCode,

    findMachineBySerialNumber,

    findVendorById,

    createMachine,

    createTechnicalSpecification,

    createOperationalSpecification,

    createServiceContract,

    createMaintenance,

    getMachineById,

    getAllMachines

};