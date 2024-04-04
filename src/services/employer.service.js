const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { Employer } = require('../models/employer.model');

const createEmployer = async (req) => {
  let body = req.body;
  let creation = await Employer.create(body);
  return creation;
};

const getAllEmployer = async (req) => {
  const getEmpl = await Employer.find();
  return getEmpl;
};

const updateEmployerById = async (req) => {
  let findEmp = await Employer.findById(req.params.id);
  if (!findEmp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Employer Not Found');
  }
  findEmp = await Employer.findByIdAndUpdate({ _id: findEmp._id }, req.body, { new: true });
  return findEmp;
};

const deleteEmployerById = async (req) => {
  let findEmp = await Employer.findById(req.params.id);
  if (!findEmp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Employer Not Found');
  }
  await Employer.deleteOne({ _id: req.params.id });
  return { message: 'Deleted' };
};

module.exports = {
  createEmployer,
  getAllEmployer,
  updateEmployerById,
  deleteEmployerById,
};
