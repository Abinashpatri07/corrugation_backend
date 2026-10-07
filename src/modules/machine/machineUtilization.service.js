// =====================================================
// MACHINE UTILIZATION SERVICE
// =====================================================

const pool =
    require('../../config/database');

const repository =
    require('./machineUtilization.repository');


// =====================================================
// GET MACHINE UTILIZATION
// =====================================================

const getMachineUtilization = async (
    machineId,
    range = 'last_week'
) => {

    const id = Number(machineId);

    if (!Number.isInteger(id)) {

        const error =
            new Error('Invalid machine id');

        error.statusCode = 400;

        throw error;
    }


    // -------------------------------------------------
    // Calculate date range
    // -------------------------------------------------

    const endDate =
        new Date();

    const startDate =
        new Date();


    if (range === 'last_week') {

        startDate.setDate(
            endDate.getDate() - 6
        );

    } else if (range === 'last_month') {

        startDate.setDate(
            endDate.getDate() - 29
        );

    } else {

        // Default = last 7 days
        startDate.setDate(
            endDate.getDate() - 6
        );
    }


    // -------------------------------------------------
    // Format dates
    // -------------------------------------------------

    const formatDate = (date) => {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, '0');

        const day =
            String(
                date.getDate()
            ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };


    const start =
        formatDate(startDate);

    const end =
        formatDate(endDate);


    const client =
        await pool.connect();


    try {

        let rows =
            await repository.getUtilizationData(
                client,
                id,
                start,
                end
            );


        // =====================================================
        // FALLBACK TO LATEST AVAILABLE DATA
        // =====================================================
        // If there is no production data in the selected
        // date range, use the latest available records.
        // This prevents the Utilization page from appearing empty.
        // =====================================================

        if (!rows.length) {

            console.log(
                `No utilization records found for machine ${id} between ${start} and ${end}.`
            );

            console.log(
                `Loading latest available utilization records for machine ${id}.`
            );

            rows =
                await repository.getLatestUtilizationData(
                    client,
                    id,
                    7
                );

            console.log('==========================================');
            console.log('LATEST UTILIZATION DEBUG');
            console.log('Machine ID:', id);
            console.log('Latest rows:', rows.length);
            console.log('Latest data:', rows);
            console.log('==========================================');
        }
        console.log('==========================================');
        console.log('MACHINE UTILIZATION DEBUG');
        console.log('Machine ID:', id);
        console.log('Range:', range);
        console.log('Start Date:', start);
        console.log('End Date:', end);
        console.log('Rows from date query:', rows.length);
        console.log('Rows:', rows);
        console.log('==========================================');

        // -------------------------------------------------
        // No records
        // -------------------------------------------------

        if (!rows.length) {

            return {

                machine_id: id,

                period: {
                    start_date: start,
                    end_date: end
                },

                graph: [],

                summary: {
                    average_utilization: null,
                    peak_utilization: null,
                    lowest_utilization: null,
                    operating_hours: null
                },

                production_performance: {
                    target: null,
                    completed: null,
                    remaining: null,
                    rejected: null,
                    quality_score: null
                },

                working_hours: {
                    today_hours: null,
                    weekly_off: 0,
                    working_days: 0,
                    reported_hours: 0,
                    runtime_hours: 0,
                    idle_hours: 0
                },

                production_report: []
            };
        }


        // =================================================
        // UTILIZATION GRAPH
        // =================================================

        const graph =
            rows.map((row) => ({

                date:
                    row.production_date,

                day:
                    new Date(
                        row.production_date
                    ).toLocaleDateString(
                        'en-US',
                        {
                            weekday: 'short'
                        }
                    ),

                value:
                    row.utilization_percent !== null
                        ? Number(
                            row.utilization_percent
                        )
                        : 0

            }));


        // =================================================
        // UTILIZATION SUMMARY
        // =================================================

        const utilizationValues =
            rows
                .map(row =>
                    row.utilization_percent
                )
                .filter(value =>
                    value !== null
                )
                .map(Number);


        const averageUtilization =
            utilizationValues.length
                ? utilizationValues.reduce(
                    (sum, value) =>
                        sum + value,
                    0
                ) / utilizationValues.length
                : null;


        const peakUtilization =
            utilizationValues.length
                ? Math.max(
                    ...utilizationValues
                )
                : null;


        const lowestUtilization =
            utilizationValues.length
                ? Math.min(
                    ...utilizationValues
                )
                : null;


        const operatingHours =
            rows.reduce(
                (sum, row) =>
                    sum +
                    Number(
                        row.runtime_hours || 0
                    ),
                0
            );


        // =================================================
        // LATEST PRODUCTION DATA
        // =================================================

        // =================================================
        // LATEST PRODUCTION DATA
        // =================================================

        const latest =
            rows[rows.length - 1];


        const target =
            latest.target_quantity !== null
                ? Number(
                    latest.target_quantity
                )
                : null;


        const completed =
            latest.production_quantity !== null
                ? Number(
                    latest.production_quantity
                )
                : null;


        const remaining =
            target !== null &&
                completed !== null
                ? Math.max(
                    target - completed,
                    0
                )
                : null;


        // =================================================
        // REJECTED
        // =================================================

        const rejected =
            latest.rejected_quantity !== null
                ? Number(
                    latest.rejected_quantity
                )
                : null;


        // =================================================
        // PRODUCTIVITY
        // =================================================

        const productivity =
            target !== null &&
                target > 0 &&
                completed !== null &&
                rejected !== null
                ? Number(
                    (
                        (
                            (completed - rejected) /
                            target
                        ) * 100
                    ).toFixed(2)
                )
                : null;


        // =================================================
        // QUALITY SCORE
        // =================================================

        const qualityScore =
            latest.quality_score !== null
                ? Number(
                    latest.quality_score
                )
                : null;


        // =================================================
        // WORKING HOURS SUMMARY
        // =================================================

        const isTrueValue = (value) => {

            return (
                value === true ||
                value === 1 ||
                value === '1' ||
                value === 'true' ||
                value === 'TRUE' ||
                value === 'yes' ||
                value === 'YES' ||
                value === 'Yes'
            );

        };


        const weeklyOff =
            rows.filter(
                row => isTrueValue(row.weekly_off)
            ).length;


        const workingDays =
            rows.filter(
                row => isTrueValue(row.working_day)
            ).length;

        const reportedHours =
            rows.reduce(
                (sum, row) =>
                    sum +
                    Number(
                        row.reported_hours || 0
                    ),
                0
            );

        const plannedHours =
            rows.reduce(
                (sum, row) =>
                    sum +
                    Number(
                        row.planned_hours || 0
                    ),
                0
            );

        const runtimeHours =
            rows.reduce(
                (sum, row) =>
                    sum +
                    Number(
                        row.runtime_hours || 0
                    ),
                0
            );


        const idleHours =
            rows.reduce(
                (sum, row) =>
                    sum +
                    Number(
                        row.idle_hours || 0
                    ),
                0
            );

        const downtimeHours =
            rows.reduce(
                (sum, row) =>
                    sum +
                    Number(
                        row.downtime_hours || 0
                    ),
                0
            );


        const todayHours =
            latest.reported_hours !== null
                ? Number(
                    latest.reported_hours
                )
                : null;


        // =================================================
        // PRODUCTION REPORT
        // =================================================

        const productionReport =
            rows.map(row => {

                const rowTarget =
                    row.target_quantity !== null
                        ? Number(
                            row.target_quantity
                        )
                        : null;

                const rowProduction =
                    row.production_quantity !== null
                        ? Number(
                            row.production_quantity
                        )
                        : null;

                const rowProductivity =
                    rowTarget !== null &&
                        rowTarget > 0 &&
                        rowProduction !== null
                        ? Number(
                            (
                                (rowProduction / rowTarget) *
                                100
                            ).toFixed(2)
                        )
                        : null;

                return {

                    date:
                        row.production_date,

                    todaysHours:
                        row.planned_hours !== null
                            ? Number(
                                row.planned_hours
                            )
                            : null,

                    weeklyOff:
                        row.weekly_off
                            ? 1
                            : 0,

                    workingDay:
                        row.working_day
                            ? 'Yes'
                            : 'No',

                    plannedHours:
                        row.planned_hours !== null
                            ? Number(
                                row.planned_hours
                            )
                            : null,

                    reportedHours:
                        row.reported_hours !== null
                            ? Number(
                                row.reported_hours
                            )
                            : null,

                    idleHours:
                        row.idle_hours !== null
                            ? Number(
                                row.idle_hours
                            )
                            : null,

                    downtime:
                        row.downtime_hours !== null
                            ? Number(
                                row.downtime_hours
                            )
                            : null,

                    utilization:
                        row.utilization_percent !== null
                            ? Number(
                                row.utilization_percent
                            )
                            : null,

                    target:
                        rowTarget,

                    production:
                        rowProduction,

                    reject:
                        row.rejected_quantity !== null
                            ? Number(
                                row.rejected_quantity
                            )
                            : null,

                    productivity:
                        rowProductivity,

                    qualityScore:
                        row.quality_score !== null
                            ? Number(
                                row.quality_score
                            )
                            : null

                };

            });


        // =====================================================
        // FINAL UTILIZATION RESPONSE
        // =====================================================

        return {

            machine_id: id,

            period: {

                start_date: start,

                end_date: end

            },

            graph,

            summary: {

                average_utilization:
                    averageUtilization !== null
                        ? Number(
                            averageUtilization.toFixed(2)
                        )
                        : null,

                peak_utilization:
                    peakUtilization,

                lowest_utilization:
                    lowestUtilization,

                operating_hours:
                    Number(
                        operatingHours.toFixed(2)
                    )

            },

            production_performance: {

                target,

                completed,

                remaining,

                rejected,

                productivity,

                quality_score:
                    qualityScore

            },

            working_hours: {

                today_hours:
                    todayHours,

                weekly_off:
                    weeklyOff,

                working_days:
                    workingDays,

                planned_hours:
                    Number(
                        plannedHours.toFixed(2)
                    ),

                reported_hours:
                    Number(
                        reportedHours.toFixed(2)
                    ),

                runtime_hours:
                    Number(
                        runtimeHours.toFixed(2)
                    ),

                idle_hours:
                    Number(
                        idleHours.toFixed(2)
                    ),

                downtime_hours:
                    Number(
                        downtimeHours.toFixed(2)
                    )

            },

            production_report:
                productionReport

        };


    } finally {

        client.release();

    }

};


module.exports = {
    getMachineUtilization
};