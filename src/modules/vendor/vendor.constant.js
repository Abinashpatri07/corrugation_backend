const VENDOR_STATUS = Object.freeze({
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  APPROVED: 'Approved',
});

const VENDOR_TYPES = Object.freeze([
  'Key Accounts',
  'Strategic',
  'Regular',
  'Local',
]);

const PAYMENT_TERMS = Object.freeze([
  'Advance',
  'Due on Receipt',
  'Net 15',
  'Net 30',
  'Net 45',
  'Net 60',
  'Net 90',
]);

const ORDER_STATUS = Object.freeze([
  'Draft',
  'Pending',
  'Approved',
  'Partially Received',
  'Received',
  'Cancelled',
]);

const QC_STATUS = Object.freeze([
  'Passed',
  'Minor Deviation',
  'Rejected - Moisture',
  'Rejected',
  'Under Evaluation',
]);

module.exports = {
  VENDOR_STATUS,
  VENDOR_TYPES,
  PAYMENT_TERMS,
  ORDER_STATUS,
  QC_STATUS,
};