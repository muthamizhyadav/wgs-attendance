const httpStatus = require('http-status');
const WhytapService = require('../services/whytap.service');
const catchAsync = require('../utils/catchAsync');
const { tokenService } = require('../services');
const { any } = require('joi');

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

const createBatch = catchAsync(async (req, res) => {
  const data = await WhytapService.createBatch(req);
  res.send(data);
})

const createCourse = catchAsync(async (req, res) => {
  const data = await WhytapService.createCourse(req);
  res.send(data);
})
const createCompany = catchAsync(async (req, res) => {
  const data = await WhytapService.createCompany(req);
  res.send(data);
})

const getStudent = catchAsync(async (req, res) => {
  const data = await WhytapService.getStudent(req);
  res.send(data);
});
const getCompany = catchAsync(async (req, res) => {
  const data = await WhytapService.getCompany(req);
  res.send(data);
});

const updateStudentbyId = catchAsync(async (req, res) => {
  const data = await WhytapService.updateStudentbyId(req);
  res.send(data);
});
const updateCompany = catchAsync(async (req, res) => {
  const data = await WhytapService.updateCompany(req);
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

const getPlaceMentsByStudents = catchAsync(async (req, res) => {
  const data = await WhytapService.getPlaceMentsByStudents(req);
  res.send(data);
});

const getbatch = catchAsync(async (req, res) => {
  const data = await WhytapService.getBatch(req)
  res.send(data)
})

const updateBatch = catchAsync(async (req, res) => {
  const data = await WhytapService.updateBatch(req)
  res.send(data)
})
const getCourse = catchAsync(async (req, res) => {
  const data = await WhytapService.getCourse(req)
  res.send(data)
})

const updateCourse = catchAsync(async (req, res) => {
  const data = await WhytapService.updateCourse(req)
  res.send(data)
})

const deleteById_withMenu = catchAsync(async (req, res) => {
  const data = await WhytapService.DeleteDataWithIdandMenu(req);
  res.send(data)
})

const getDashboardCounts = catchAsync(async (req, res) => {
  const data = await WhytapService.DashboardCounts(req);
  res.send(data)
})

const getBatchStudents = catchAsync(async (req, res) => {
  const data = await WhytapService.getBatchStudents(req)
  res.send(data);
})

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
  getPlaceMentsByStudents,
  createBatch,
  getbatch,
  updateBatch,
  getCourse,
  updateCourse,
  createCourse,
  getCompany,
  createCompany,
  updateCompany,
  deleteById_withMenu,
  getDashboardCounts,
  getBatchStudents
};
