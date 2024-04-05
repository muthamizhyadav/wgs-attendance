const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { Employer, Attendance } = require('../models/employer.model');
const moment = require('moment');

const createEmployer = async (req) => {
  let body = req.body;
  let findbyEmpId = await Employer.findOne({ empId: body.empId });
  if (!findbyEmpId) {
    throw new ApiError(httpStatus.BAD_REQUEST, { message: "Employer Exist's" });
  }
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

// Attendance ManageMents Api's
const Addattendance_EveryDay = (req) => {
  const date = new Date();
  let monthName = date.toLocaleString('default', { month: 'long' });
  let currentDate = moment().format('DD-MM-YYYY');

  return new Promise((resolve, reject) => {
    let body = req.body;
    let createAttPromises = body.map((element) => {
      return Attendance.create({ ...element, ...{ month: monthName, date: currentDate } });
    });

    Promise.all(createAttPromises)
      .then(() => {
        resolve('Attendance records created successfully.');
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const updateAttendance = async (req) => {
  let findAttById = await Attendance.findById(req.params.id);
  if (!findAttById) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Attendance Not Found');
  }
  findAttById = await Attendance.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true });
  return findAttById;
};

const getAttendance = async (req) => {
  let values = await Attendance.aggregate([
    {
      $match: {
        _id: {
          $ne: null,
        },
      },
    },
  ]);
  return values;
};

module.exports = {
  createEmployer,
  getAllEmployer,
  updateEmployerById,
  deleteEmployerById,
  Addattendance_EveryDay,
  updateAttendance,
  getAttendance,
};
