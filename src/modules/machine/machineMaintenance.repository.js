// =====================================================
// MACHINE MAINTENANCE REPOSITORY
// =====================================================
// Repository = Database layer.
//
// All SQL related to machine maintenance is kept here.
// =====================================================

const pool =
    require('../../config/database');


// =====================================================
// GET MACHINE MAINTENANCE
// =====================================================

const getMachineMaintenance = async (
    machineId
) => {

    // =================================================
    // MAIN MACHINE
    // =================================================

    const machineResult =
        await pool.query(
            `
            SELECT
                machine_id,
                machine_code,
                machine_name,
                machine_status

            FROM public.machine

            WHERE machine_id = $1
            `,
            [
                machineId
            ]
        );


    if (
        machineResult.rows.length === 0
    ) {

        return null;

    }


    const machine =
        machineResult.rows[0];


    // =================================================
    // ALL MAINTENANCE HISTORY
    // =================================================

    const historyResult =
        await pool.query(
            `
            SELECT

                mm.maintenance_id,

                mm.maintenance_number,

                mm.maintenance_type,

                mm.maintenance_status,

                mm.maintenance_date,

                mm.next_maintenance_date,

                mm.priority,

                mm.technician_name,

                mm.technician_phone,

                mm.frequency,

                mm.estimated_duration,

                mm.actual_duration,

                mm.duration_unit,

                mm.maintenance_cost,

                mm.work_performed,

                mm.description,

                mm.remarks,

                mm.vendor_id,

                v.vendor_code,

                v.display_name AS vendor_name,

                v.company_name

            FROM public.machine_maintenance mm

            LEFT JOIN public.vendor v
                ON v.vendor_id =
                    mm.vendor_id

            WHERE mm.machine_id = $1

            ORDER BY
                mm.maintenance_date DESC,
                mm.maintenance_id DESC
            `,
            [
                machineId
            ]
        );


    const history =
        historyResult.rows;


    // =================================================
    // LAST COMPLETED MAINTENANCE
    // =================================================

    const lastMaintenanceResult =
        await pool.query(
            `
            SELECT

                mm.maintenance_id,

                mm.maintenance_number,

                mm.maintenance_type,

                mm.maintenance_status,

                mm.maintenance_date,

                mm.next_maintenance_date,

                mm.priority,

                mm.technician_name,

                mm.technician_phone,

                mm.frequency,

                mm.estimated_duration,

                mm.actual_duration,

                mm.duration_unit,

                mm.maintenance_cost,

                mm.work_performed,

                mm.description,

                mm.remarks,

                mm.vendor_id,

                v.vendor_code,

                v.display_name AS vendor_name,

                v.company_name

            FROM public.machine_maintenance mm

            LEFT JOIN public.vendor v
                ON v.vendor_id =
                    mm.vendor_id

            WHERE
                mm.machine_id = $1

                AND mm.maintenance_status =
                    'COMPLETED'

            ORDER BY
                mm.maintenance_date DESC,
                mm.maintenance_id DESC

            LIMIT 1
            `,
            [
                machineId
            ]
        );


    const lastMaintenance =
        lastMaintenanceResult.rows[0] ||
        null;


    // =================================================
    // UPCOMING MAINTENANCE
    // =================================================

    const upcomingResult =
        await pool.query(
            `
            SELECT

                mm.maintenance_id,

                mm.maintenance_number,

                mm.maintenance_type,

                mm.maintenance_status,

                mm.maintenance_date,

                mm.next_maintenance_date,

                mm.priority,

                mm.technician_name,

                mm.technician_phone,

                mm.frequency,

                mm.estimated_duration,

                mm.actual_duration,

                mm.duration_unit,

                mm.maintenance_cost,

                mm.work_performed,

                mm.description,

                mm.remarks,

                mm.vendor_id,

                v.vendor_code,

                v.display_name AS vendor_name,

                v.company_name

            FROM public.machine_maintenance mm

            LEFT JOIN public.vendor v
                ON v.vendor_id =
                    mm.vendor_id

            WHERE
                mm.machine_id = $1

                AND (

                    mm.next_maintenance_date >=
                        CURRENT_DATE

                    OR

                    (
                        mm.maintenance_date >=
                            CURRENT_DATE

                        AND mm.maintenance_status IN (
                            'SCHEDULED',
                            'IN_PROGRESS'
                        )
                    )

                )

            ORDER BY

                COALESCE(
                    mm.next_maintenance_date,
                    mm.maintenance_date
                ) ASC,

                mm.maintenance_id ASC

            LIMIT 1
            `,
            [
                machineId
            ]
        );


    const upcomingMaintenance =
        upcomingResult.rows[0] ||
        null;


    // =================================================
    // SERVICE CONTRACT
    // =================================================

    const serviceContractResult =
        await pool.query(
            `
            SELECT

                sc.service_contract_id,

                sc.contract_number,

                sc.vendor_id,

                sc.contract_start_date,

                sc.contract_end_date,

                sc.contact_person,

                sc.designation,

                sc.mobile_number,

                sc.email,

                sc.service_contract_status,

                sc.service_frequency_days,

                sc.remarks,

                v.vendor_code,

                v.display_name AS vendor_name,

                v.company_name

            FROM public.machine_service_contract sc

            LEFT JOIN public.vendor v
                ON v.vendor_id =
                    sc.vendor_id

            WHERE sc.machine_id = $1

            ORDER BY
                sc.service_contract_id DESC

            LIMIT 1
            `,
            [
                machineId
            ]
        );


    const serviceContract =
        serviceContractResult.rows[0] ||
        null;


    // =================================================
    // AVERAGE MAINTENANCE DURATION
    // =================================================

    const averageDurationResult =
        await pool.query(
            `
            SELECT
                AVG(
                    COALESCE(
                        actual_duration,
                        estimated_duration
                    )
                ) AS average_duration

            FROM public.machine_maintenance

            WHERE
                machine_id = $1

                AND (
                    actual_duration IS NOT NULL
                    OR
                    estimated_duration IS NOT NULL
                )
            `,
            [
                machineId
            ]
        );


    const averageDuration =
        averageDurationResult.rows[0]
            ?.average_duration ??
        null;


    return {

        machine,

        history,

        lastMaintenance,

        upcomingMaintenance,

        serviceContract,

        averageDuration

    };

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getMachineMaintenance

};