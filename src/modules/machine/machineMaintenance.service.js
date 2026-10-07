// =====================================================
// MACHINE MAINTENANCE SERVICE
// =====================================================
// Service layer = Business logic.
// =====================================================

const repository =
    require('./machineMaintenance.repository');


// =====================================================
// GET MACHINE MAINTENANCE
// =====================================================

const getMachineMaintenance = async (
    machineId
) => {

    const id =
        Number(machineId);


    // =================================================
    // VALIDATE MACHINE ID
    // =================================================

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {

        const error =
            new Error(
                'Invalid machine id'
            );

        error.statusCode = 400;

        throw error;

    }


    // =================================================
    // GET DATA
    // =================================================

    const result =
        await repository.getMachineMaintenance(
            id
        );


    // =================================================
    // MACHINE NOT FOUND
    // =================================================

    if (!result) {

        const error =
            new Error(
                'Machine not found'
            );

        error.statusCode = 404;

        throw error;

    }


    // =================================================
    // DATA REFERENCES
    // =================================================

    const {
        machine,
        history,
        lastMaintenance,
        upcomingMaintenance,
        serviceContract,
        averageDuration
    } = result;


    // =================================================
    // SELECT VENDOR
    //
    // Prefer maintenance vendor.
    // Otherwise use service-contract vendor.
    // =================================================

    const vendor =
        lastMaintenance?.vendor_id
            ? lastMaintenance
            : upcomingMaintenance?.vendor_id
                ? upcomingMaintenance
                : serviceContract;


    // =================================================
    // MAINTENANCE SUMMARY
    // =================================================

    const summarySource =
        upcomingMaintenance ||
        lastMaintenance ||
        history[0] ||
        {};


    // =================================================
    // NEXT DATE
    // =================================================

    const nextDate =
        upcomingMaintenance?.next_maintenance_date ||
        upcomingMaintenance?.maintenance_date ||
        null;


    // =================================================
    // DAYS REMAINING
    // =================================================

    let daysRemaining = null;


    if (nextDate) {

        const today =
            new Date();


        const next =
            new Date(nextDate);


        today.setHours(
            0,
            0,
            0,
            0
        );

        next.setHours(
            0,
            0,
            0,
            0
        );


        const difference =
            next.getTime() -
            today.getTime();


        daysRemaining =
            Math.ceil(
                difference /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );

    }


    // =================================================
    // FREQUENCY
    // =================================================

    const frequency =
        summarySource.frequency ||
        null;


    const cycleDays =
        serviceContract?.service_frequency_days ||
        null;


    // =================================================
    // RETURN FRONTEND-FRIENDLY RESPONSE
    // =================================================

    return {

        machine: {

            id:
                machine.machine_id,

            code:
                machine.machine_code,

            name:
                machine.machine_name,

            status:
                machine.machine_status

        },


        maintenance: {

            maintenance_type:
                summarySource.maintenance_type ||
                null,

            maintenance_status:
                summarySource.maintenance_status ||
                null,

            service_vendor:
                vendor?.vendor_name ||
                vendor?.company_name ||
                null,

            vendor_id:
                vendor?.vendor_id ||
                null,

            maintenance_contact:
                serviceContract?.mobile_number ||
                summarySource.technician_phone ||
                null,

            last_service_cost:
                lastMaintenance?.maintenance_cost ||
                null,

            note:
                lastMaintenance?.remarks ||
                lastMaintenance?.description ||
                lastMaintenance?.work_performed ||
                null

        },


        last_maintenance: {

            maintenance_id:
                lastMaintenance?.maintenance_id ||
                null,

            maintenance_number:
                lastMaintenance?.maintenance_number ||
                null,

            date:
                lastMaintenance?.maintenance_date ||
                null,

            maintenance_type:
                lastMaintenance?.maintenance_type ||
                null,

            duration:
                lastMaintenance?.actual_duration ??
                lastMaintenance?.estimated_duration ??
                null,

            duration_unit:
                lastMaintenance?.duration_unit ||
                'HOURS',

            cost:
                lastMaintenance?.maintenance_cost ??
                null,

            technician:
                lastMaintenance?.technician_name ||
                null,

            technician_phone:
                lastMaintenance?.technician_phone ||
                null,

            work_performed:
                lastMaintenance?.work_performed ||
                lastMaintenance?.description ||
                null,

            status:
                lastMaintenance?.maintenance_status ||
                null

        },


        vendor: {

            id:
                vendor?.vendor_id ||
                null,

            code:
                vendor?.vendor_code ||
                null,

            name:
                vendor?.vendor_name ||
                vendor?.company_name ||
                null,

            contact:
                serviceContract?.mobile_number ||
                null,

            contact_person:
                serviceContract?.contact_person ||
                null,

            email:
                serviceContract?.email ||
                null,

            agreement_status:
                serviceContract?.service_contract_status ||
                null

        },


        upcoming_maintenance: {

            maintenance_id:
                upcomingMaintenance?.maintenance_id ||
                null,

            maintenance_number:
                upcomingMaintenance?.maintenance_number ||
                null,

            next_maintenance_date:
                nextDate,

            priority:
                upcomingMaintenance?.priority ||
                null,

            estimated_duration:
                upcomingMaintenance?.estimated_duration ??
                null,

            duration_unit:
                upcomingMaintenance?.duration_unit ||
                'HOURS',

            maintenance_type:
                upcomingMaintenance?.maintenance_type ||
                null,

            maintenance_status:
                upcomingMaintenance?.maintenance_status ||
                null,

            days_remaining:
                daysRemaining

        },


        frequency: {

            frequency:
                frequency,

            cycle_days:
                cycleDays,

            average_duration:
                averageDuration

        },


        history:
            history.map(
                (item) => ({

                    maintenance_id:
                        item.maintenance_id,

                    maintenance_number:
                        item.maintenance_number,

                    date:
                        item.maintenance_date,

                    type:
                        item.maintenance_type,

                    description:
                        item.work_performed ||
                        item.description ||
                        item.remarks ||
                        null,

                    technician:
                        item.technician_name ||
                        null,

                    cost:
                        item.maintenance_cost ??
                        null,

                    status:
                        item.maintenance_status

                })
            )

    };

};


module.exports = {

    getMachineMaintenance

};