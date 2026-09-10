const Joi = require('joi');

const addressSchema = Joi.object({
  address_type: Joi.string().valid('Billing', 'Shipping').required(),
  address_line1: Joi.string().max(255).required(),
  address_line2: Joi.string().max(255).allow('', null),
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100).required(),
  country: Joi.string().max(100).default('India'),
  pincode: Joi.string().max(20).required(),
  contact_name: Joi.string().max(150).allow('', null),
});

const contactSchema = Joi.object({
  salutation: Joi.string().max(20).allow('', null),
  first_name: Joi.string().max(100).required(),
  last_name: Joi.string().max(100).allow('', null),
  designation: Joi.string().max(100).allow('', null),
  department: Joi.string().max(100).allow('', null),
  phone: Joi.string().max(30).required(),
  email: Joi.string().email().allow('', null),
  is_primary: Joi.boolean().default(false),
});

const bankSchema = Joi.object({
  bank_name: Joi.string().max(150).required(),
  account_holder_name: Joi.string().max(150).required(),
  account_number: Joi.string().max(50).required(),
  ifsc_code: Joi.string().max(20).required(),
  open_date: Joi.date().allow(null, ''),
  is_primary: Joi.boolean().default(false),
});

const documentSchema = Joi.object({
  document_type: Joi.string().max(100).required(),
  document_number: Joi.string().max(100).allow('', null),
  document_url: Joi.string().uri().allow('', null),
});

const reelSpecificationSchema = Joi.object({
  material_code: Joi.string().max(50).required(),
  material_name: Joi.string().max(150).required(),
  gsm_min: Joi.number().precision(2).required(),
  gsm_max: Joi.number().precision(2).required(),
  reel_width_min: Joi.number().precision(2).required(),
  reel_width_max: Joi.number().precision(2).required(),
  quality_score: Joi.number().min(0).max(100).default(0),
  status: Joi.string().valid('Approved', 'Under Evaluation', 'Rejected').default('Under Evaluation'),
});

const createVendorSchema = Joi.object({
  vendor_type: Joi.string().max(50).default('Regular'),
  primary_salutation: Joi.string().max(20).allow('', null),
  primary_first_name: Joi.string().max(100).required(),
  primary_last_name: Joi.string().max(100).allow('', null),
  display_name: Joi.string().max(200).required(),
  company_name: Joi.string().max(200).required(),
  vendor_language: Joi.string().max(50).default('English'),
  email: Joi.string().email().required(),
  primary_number: Joi.string().max(30).required(),
  secondary_number: Joi.string().max(30).allow('', null),
  pan: Joi.string().max(20).required(),
  gstin: Joi.string().max(20).allow('', null),
  msme: Joi.string().max(100).required(),
  currency: Joi.string().max(10).default('INR'),
  opening_balance: Joi.number().precision(2).min(0).default(0),
  accounts_payable: Joi.number().precision(2).min(0).default(0),
  payment_terms: Joi.string().max(50).default('Net 30'),
  advance_required: Joi.string().max(50).default('None'),
  status: Joi.string().valid('Draft', 'Active', 'Inactive', 'Approved').default('Draft'),
  addresses: Joi.array().items(addressSchema).default([]),
  contacts: Joi.array().items(contactSchema).default([]),
  banks: Joi.array().items(bankSchema).default([]),
  documents: Joi.array().items(documentSchema).default([]),
  reel_specifications: Joi.array().items(reelSpecificationSchema).default([]),
});

const updateVendorSchema = createVendorSchema.fork(
  ['primary_first_name', 'display_name', 'company_name', 'email', 'primary_number', 'pan', 'msme'],
  schema => schema.optional()
);

const validate = schema => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map(d => d.message),
    });
  }

  req.body = value;
  next();
};

module.exports = {
  validate,
  createVendorSchema,
  updateVendorSchema,
  reelSpecificationSchema,
};
