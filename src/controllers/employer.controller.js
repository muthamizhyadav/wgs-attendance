const httpStatus = require('http-status');
const EmployerService = require('../services/employer.service');
const catchAsync = require('../utils/catchAsync');
const { Employer } = require('../models/employer.model');

const createEmployer = catchAsync(async (req, res) => {
  const data = await EmployerService.createEmployer(req);
  res.send(data);
});

const getAllEmployer = catchAsync(async (req, res) => {
  const data = await EmployerService.getAllEmployer(req);
  res.send(data);
});
const getAllEmployerAtten = catchAsync(async (req, res) => {
  const data = await EmployerService.getAllEmployerAtten(req);
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

const Addattendance_EveryDay = catchAsync(async (req, res) => {
  const data = await EmployerService.Addattendance_EveryDay(req);
  res.send(data);
});

const updateAttendance = catchAsync(async (req, res) => {
  const data = await EmployerService.updateAttendance(req);
  res.send(data);
});

const getAttendance = catchAsync(async (req, res) => {
  const data = await EmployerService.getAttendance(req);
  res.send(data);
});

const getEmployerById = catchAsync(async (req, res) => {
  const data = await EmployerService.getEmployerById(req);
  res.send(data);
});

//
const getEmployeeById = catchAsync(async (req, res) => {
  const data = await EmployerService.getEmployeeById(req);
  res.send(data);
});

const gettodayReportCounts = catchAsync(async (req, res) => {
  const data = await EmployerService.gettodayReportCounts(req);
  res.send(data);
});

const getWeekoffById = catchAsync(async (req, res) => {
  const data = await EmployerService.getWeekoffById(req);
  res.send(data);
});

const createCompOff = catchAsync(async (req, res) => {
  const data = await EmployerService.createCompOff(req);
  res.send(data);
});
const getCompOffById = catchAsync(async (req, res) => {
  const data = await EmployerService.getCompOffById(req);
  res.send(data);
});
const getEmployeeStatusById = catchAsync(async (req, res) => {
  const data = await EmployerService.getEmployeeStatusById(req);
  res.send(data);
});
const deductCompOff = catchAsync(async (req, res) => {
  const data = await EmployerService.deductCompOff(req);
  res.send(data);
});
const createPermission = catchAsync(async (req, res) => {
  const data = await EmployerService.createPermission(req);
  res.send(data);
});
const getPermissionStatus = catchAsync(async (req, res) => {
  const data = await EmployerService.getPermissionStatus(req);
  res.send(data);
});
const getPermission = catchAsync(async (req, res) => {
  const data = await EmployerService.getPermission(req);
  res.send(data);
});
const updatePermission = catchAsync(async (req, res) => {
  const data = await EmployerService.updatePermission(req);
  res.send(data);
});
const deletePermission = catchAsync(async (req, res) => {
  const data = await EmployerService.deletePermission(req);
  res.send(data);
});

const EmployerBulkUpload = catchAsync(async (req, res) => {
  const data = await EmployerService.EmployerBulkUpload(req);
  res.send(data);
});

const createEventsByHr = catchAsync(async (req, res) => {
  const data = await EmployerService.createEventsByHr(req);
  res.send(data);
});

const getEvents = catchAsync(async (req, res) => {
  const data = await EmployerService.getEvents(req);
  res.send(data);
});

const createAnnouncement = catchAsync(async (req, res) => {
  const data = await EmployerService.createAnnouncement(req);
  res.send(data);
});

const getAnnouncement = catchAsync(async (req, res) => {
  const data = await EmployerService.getAnnouncement(req);
  res.send(data);
});

const getAnnouncementStaff = catchAsync(async (req, res) => {
  const data = await EmployerService.getAnnouncementStaff(req);
  res.send(data);
});

const getEventsForHr = catchAsync(async (req, res) => {
  const data = await EmployerService.getEventsForHr(req);
  res.send(data);
});

const createNewAssets = catchAsync(async (req, res) => {
  const data = await EmployerService.createNewAssets(req);
  res.send(data);
});

const getAssetsBycategory = catchAsync(async (req, res) => {
  const data = await EmployerService.getAssetsBycategory(req);
  res.send(data);
});

const assignAssets = catchAsync(async (req, res) => {
  const data = await EmployerService.assignAssets(req);
  res.send(data);
});

const UnAssigned = catchAsync(async (req, res) => {
  const data = await EmployerService.UnAssigned(req);
  res.send(data);
});

const updateAssetsById = catchAsync(async (req, res) => {
  const data = await EmployerService.updateAssetsById(req);
  res.send(data);
});

const getAssetsCoundsByCategory = catchAsync(async (req, res) => {
  const data = await EmployerService.getAssetsCoundsByCategory(req);
  res.send(data);
});

module.exports = {
  createEmployer,
  getAllEmployer,
  updateEmployerById,
  deleteEmployerById,
  Addattendance_EveryDay,
  updateAttendance,
  getAttendance,
  getEmployerById,
  getEmployeeById,
  gettodayReportCounts,
  getAllEmployerAtten,
  getWeekoffById,
  createCompOff,
  getCompOffById,
  getEmployeeStatusById,
  deductCompOff,
  createPermission,
  getPermissionStatus,
  getPermission,
  updatePermission,
  deletePermission,
  EmployerBulkUpload,
  createEventsByHr,
  getEvents,
  createAnnouncement,
  getAnnouncement,
  getAnnouncementStaff,
  getEventsForHr,
  getAssetsBycategory,
  createNewAssets,
  assignAssets,
  UnAssigned,
  updateAssetsById,
  getAssetsCoundsByCategory,
};
