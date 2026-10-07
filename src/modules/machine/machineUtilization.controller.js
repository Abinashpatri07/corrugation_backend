// =====================================================
// MACHINE UTILIZATION CONTROLLER
// =====================================================

const service =
    require('./machineUtilization.service');


// =====================================================
// GET MACHINE UTILIZATION
// =====================================================

const getMachineUtilization = async (
    req,
    res
) => {

    try {

        const {
            machineId
        } = req.params;


        const {
            range = 'last_week'
        } = req.query;


        const data =
            await service.getMachineUtilization(
                machineId,
                range
            );


        return res.status(200).json({

            success: true,

            data

        });

    } catch (error) {

        console.error(
            'Failed to get machine utilization:',
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                'Failed to get machine utilization'

        });

    }

};


module.exports = {
    getMachineUtilization
};