// =====================================================
// MACHINE CONTROLLER
// =====================================================
// Controller handles HTTP requests and responses.
//
// Controller does NOT contain SQL.
// Controller calls the service.
// =====================================================

const machineService =
    require('./machine.service');


// =====================================================
// GET USER ID
// =====================================================
// If authentication middleware exists, it may provide:
//
// req.user.user_id
//
// If authentication is not implemented yet,
// this returns null.
// =====================================================

const getUserId = (req) => {

    return (

        req.user?.user_id ||

        req.user?.id ||

        req.body?.created_by ||

        null

    );

};


// =====================================================
// CREATE MACHINE
// =====================================================
// POST /api/v1/machines
// =====================================================

const createMachine = async (
    req,
    res
) => {

    try {

        const result =
            await machineService.createMachine(
                req.body,
                getUserId(req)
            );


        return res.status(201).json({

            success: true,

            message:
                'Machine profile created successfully',

            data: result

        });


    } catch (error) {

        console.error(
            'Create machine error:',
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                'Failed to create machine',

            // Send validation errors
            // if they exist.
            ...(error.details
                ? {
                    errors:
                        error.details
                }
                : {})

        });

    }

};


// =====================================================
// GET MACHINE BY ID
// =====================================================

const getMachine = async (
    req,
    res
) => {

    try {

        const machine =
            await machineService.getMachineById(
                req.params.id
            );


        if (
            !machine
        ) {

            return res.status(404).json({

                success: false,

                message:
                    'Machine not found'

            });

        }


        return res.status(200).json({

            success: true,

            data: machine

        });


    } catch (error) {

        console.error(
            'Get machine error:',
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                'Failed to get machine'

        });

    }

};


// =====================================================
// GET ALL MACHINES
// =====================================================

const getMachines = async (
    req,
    res
) => {

    try {

        const machines =
            await machineService.getAllMachines();


        return res.status(200).json({

            success: true,

            count:
                machines.length,

            data:
                machines

        });


    } catch (error) {

        console.error(
            'Get machines error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Failed to get machines'

        });

    }

};


/*
=========================================================
GET ALL MACHINES
=========================================================

GET /api/v1/machines
=========================================================
*/

const getAllMachines = async (req, res) => {

    try {

        const machines =
            await machineService.getAllMachines();


        return res.status(200).json({

            success: true,

            message: 'Machines fetched successfully',

            data: machines

        });

    } catch (error) {

        console.error(
            'Get machines error:',
            error
        );


        return res.status(500).json({

            success: false,

            message: 'Failed to fetch machines',

            error: error.message

        });

    }
};

module.exports = {

    createMachine,

    getMachine,

    getMachines,

    getAllMachines

};