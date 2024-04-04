const httpStatus = require('http-status');
const EmployerService = require('../services/employer.service');
const catchAsync = require('../utils/catchAsync');

const createEmployer = catchAsync(async (req, res) => {
  const data = await EmployerService.createEmployer(req);
  res.send(data);
});

const getAllEmployer = catchAsync(async (req, res) => {
  const data = await EmployerService.getAllEmployer(req);
  res.send(data);
});

const updateEmployerById = catchAsync(async (req, res) => {
  const data = await EmployerService.updateEmployerById(req);
  res.send(data);
});

const deleteEmployerById = catchAsync(async (req, res) => {
  const data = await EmployerService.deleteEmployerById(req);
  res.send(data);
});

module.exports = {
  createEmployer,
  getAllEmployer,
  updateEmployerById,
  deleteEmployerById,
};