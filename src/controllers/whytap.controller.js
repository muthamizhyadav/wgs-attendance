const httpStatus = require('http-status');
const WhytapService = require('../services/whytap.service');
const catchAsync = require('../utils/catchAsync');
const { tokenService } = require('../services');

const createWhyTapAdmin = catchAsync(async (req, res) => {
  const data = await WhytapService.createWhyTapAdmin(req);
  res.send(data);
});

const LoginByEmailPassword = catchAsync(async (req, res) => {
  const data = await WhytapService.LoginByEmailPassword(req);
  const tokens = await tokenService.generateAuthTokens(data);
  res.send(tokens);
});

const createStudent = catchAsync(async (req, res) => {
  const data = await WhytapService.createStudent(req);
  res.send(data);
});

const getStudent = catchAsync(async (req, res) => {
  const data = await WhytapService.getStudent(req);
  res.send(data);
});

const updateStudentbyId = catchAsync(async (req, res) => {
  const data = await WhytapService.updateStudentbyId(req);
  res.send(data);
});

const createPlacements = catchAsync(async (req, res) => {
  const data = await WhytapService.createPlacements(req);
  res.send(data);
});

const getplacement = catchAsync(async (req, res) => {
  const data = await WhytapService.getplacement(req);
  res.send(data);
});

const updateplacementbyId = catchAsync(async (req, res) => {
  const data = await WhytapService.updateplacementbyId(req);
  res.send(data);
});

const updateCandStatusInPlaceMent = catchAsync(async (req, res) => {
  const data = await WhytapService.updateCandStatusInPlaceMent(req);
  res.send(data);
});

const getPlaceMentsById = catchAsync(async (req, res) => {
  const data = await WhytapService.getPlaceMentsById(req);
  res.send(data);
});

module.exports = {
  createWhyTapAdmin,
  LoginByEmailPassword,
  createStudent,
  getStudent,
  updateStudentbyId,
  createPlacements,
  getplacement,
  updateplacementbyId,
  updateCandStatusInPlaceMent,
  getPlaceMentsById,
};
