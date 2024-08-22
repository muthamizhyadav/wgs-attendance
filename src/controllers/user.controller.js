const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getHeads = catchAsync(async (req, res) => {
  const heads = await userService.getHeads(req);
  res.send(heads);
});

const LeaveRequest = catchAsync(async (req, res) => {
  const leaveRequest = await userService.LeaveRequest(req);
  res.send(leaveRequest);
});

const MyLeaveRequest = catchAsync(async (req, res) => {
  const data = await userService.MyLeaveRequest(req);
  res.send(data);
});

const HeadRequests = catchAsync(async (req, res) => {
  const data = await userService.HeadRequests(req);
  res.send(data);
});

const UpdateRequest = catchAsync(async (req, res) => {
  const data = await userService.UpdateRequest(req);
  res.send(data);
});

const getDetailsForPaySlip = catchAsync(async (req, res) => {
  const data = await userService.getDetailsForPaySlip(req);
  res.send(data);
});

const getEmployerLeaveDetails = catchAsync(async (req, res) => {
  const data = await userService.getEmployerLeaveDetails(req);
  res.send(data);
});

const leaveRequestsHR = catchAsync(async (req, res) => {
  const data = await userService.leaveRequestsHR(req);
  res.send(data);
});

const UpdateRequestByHR = catchAsync(async (req, res) => {
  const data = await userService.UpdateRequestByHR(req);
  res.send(data);
});

const getEmployerLeaveDetailsById = catchAsync(async (req, res) => {
  const data = await userService.getEmployerLeaveDetailsById(req);
  res.send(data);
});

const HrLeave = catchAsync(async (req, res) => {
  const data = await userService.HrLeave(req);
  res.send(data);
});

const updatePassword = catchAsync(async (req, res) => {
  const data = await userService.updatePassword(req);
  res.send(data);
});

const getUserProfile = catchAsync(async (req, res) => {
  const data = await userService.getUserProfile(req);
  res.send(data);
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getHeads,
  MyLeaveRequest,
  LeaveRequest,
  HeadRequests,
  UpdateRequest,
  getDetailsForPaySlip,
  getEmployerLeaveDetails,
  leaveRequestsHR,
  UpdateRequestByHR,
  getEmployerLeaveDetailsById,
  HrLeave,
  updatePassword,
  getUserProfile,
};
