// =====================================================
// MACHINE UTILIZATION REPOSITORY
// =====================================================
// Database queries for:
// - Utilization graph
// - Production performance
// - Working hours summary
// - Production report
// =====================================================

const getUtilizationData = async (
    client,
    machineId,
    startDate,
    endDate
) => {

    const query = `
        SELECT
            production_report_id,
            machine_id,
            production_date,
            working_day,
            weekly_off,
            planned_hours,
            reported_hours,
            runtime_hours,
            idle_hours,
            downtime_hours,
            production_quantity,
            rejected_quantity,
            target_quantity,
            utilization_percent,
            quality_score,
            remarks

        FROM public.machine_production_report

        WHERE machine_id = $1

          AND production_date >= $2

          AND production_date <= $3

        ORDER BY production_date ASC
    `;

    // const result = await client.query(
    //     query,
    //     [
    //         machineId,
    //         startDate,
    //         endDate
    //     ]
    // );

    // return result.rows;

    const result = await client.query(query, [
        machineId,
        startDate,
        endDate
    ]);

    console.log('------------------------------------------');
    console.log('UTILIZATION SQL RESULT');
    console.log('machineId:', machineId);
    console.log('startDate:', startDate);
    console.log('endDate:', endDate);
    console.log('rowCount:', result.rows.length);
    console.log('rows:', result.rows);
    console.log('------------------------------------------');

    return result.rows;
};


// =====================================================
// GET LATEST UTILIZATION DATA
// =====================================================
// Used when the selected date range has no records.
// It gets the latest available records for the machine.
// =====================================================

const getLatestUtilizationData = async (
    client,
    machineId,
    limit = 7
) => {

    const query = `
        SELECT
            production_report_id,
            machine_id,
            production_date,
            working_day,
            weekly_off,
            planned_hours,
            reported_hours,
            runtime_hours,
            idle_hours,
            downtime_hours,
            production_quantity,
            rejected_quantity,
            target_quantity,
            utilization_percent,
            quality_score,
            remarks

        FROM public.machine_production_report

        WHERE machine_id = $1

        ORDER BY production_date DESC

        LIMIT $2
    `;

    const result = await client.query(
        query,
        [
            machineId,
            limit
        ]
    );

    console.log('LATEST UTILIZATION QUERY RESULT:', {
        machineId,
        limit,
        rowCount: result.rows.length,
        rows: result.rows
    });

    return result.rows.reverse();

    // Query returns newest first.
    // Reverse it so the graph/report displays oldest → newest.
    return result.rows.reverse();
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    getUtilizationData,
    getLatestUtilizationData
};
