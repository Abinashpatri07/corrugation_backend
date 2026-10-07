// =====================================================
// MACHINE MAINTENANCE CONTROLLER
// =====================================================

const service =
    require('./machineMaintenance.service');


// =====================================================
// GET MACHINE MAINTENANCE
// =====================================================
//
// GET
// /api/v1/machines/:id/maintenance
//
// =====================================================

const getMachineMaintenance = async (
    req,
    res
) => {

    try {

        const data =
            await service.getMachineMaintenance(
                req.params.id
            );


        return res.status(200).json({

            success: true,

            message:
                'Machine maintenance fetched successfully',

            data

        });

    } catch (error) {

        console.error(
            'Get machine maintenance error:',
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                'Failed to get machine maintenance'

        });

    }

};


module.exports = {

    getMachineMaintenance

};