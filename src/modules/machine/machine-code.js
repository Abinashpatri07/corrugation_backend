// =====================================================
// MACHINE CODE HELPER
// =====================================================


// -----------------------------------------------------
// Normalize machine code
//
// Example:
//
// " mch-001 "
//        ↓
// "MCH-001"
//
// This keeps machine codes consistent.
// -----------------------------------------------------

const normalizeMachineCode = (value) => {

    if (
        value === undefined ||
        value === null
    ) {
        return '';
    }

    return String(value)
        .trim()
        .toUpperCase();

};


module.exports = {

    normalizeMachineCode

};