const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { Admin, Students, Placement } = require('../models/whytap.model');
const moment = require('moment');
const bcrypt = require('bcryptjs');

const createWhyTapAdmin = async (req) => {
  const { password } = req.body;
  let hashPassword = await bcrypt.hash(password, 8);
  let creations = await Admin.create({ ...req.body, ...{ password: hashPassword } });
  return creations;
};

const LoginByEmailPassword = async (req) => {
  const { email, password } = req.body;
  let findByEmail = await Admin.findOne({ email });
  if (!findByEmail) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email Not Found');
  }
  let comparePwd = await bcrypt.compare(password, findByEmail.password);
  if (!comparePwd) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect Password');
  }
  return findByEmail;
};

// students Modules

const createStudent = async (req) => {
  const creation = await Students.create(req.body);
  return creation;
};

const getStudent = async (req) => {
  const findAllStudents = await Students.find();
  return findAllStudents;
};

const updateStudentbyId = async (req) => {
  let findStudent = await Students.findById(req.params.id);
  if (!findStudent) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Students Not Found');
  }
  findStudent = await Students.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true });
  return findStudent;
};

// placement Modules

const createPlacements = async (req) => {
  let stds = [];
  req.body.students.map((e) => {
    let val = { id: e };
    stds.push(val);
  });
  const creation = await Placement.create({ ...req.body, ...{ students: stds } });
  return creation;
};

const getplacement = async (req) => {
  const findAllplacements = await Placement.find();
  return findAllplacements;
};

const updateplacementbyId = async (req) => {
  let findplacement = await Placement.findById(req.params.id);
  if (!findplacement) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Placement Not Found');
  }
  findplacement = await Placement.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true });
  return findplacement;
};

const updateCandStatusInPlaceMent = async (req) => {
  const { studentId, status } = req.body;
  console.log(studentId);
  let placementId = req.params.id;
  let findplacementById = await Placement.findById(placementId);
  if (!findplacementById) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Placement Not FoundI');
  }

  if (findplacementById.students.length > 0) {
    let existingData = findplacementById.students;
    let ind = findplacementById.students.findIndex((a) => a.id === studentId);
    let fetchValue = findplacementById.students.find((e) => e.id === studentId);
    let removed = existingData.splice(ind, 1);
    fetchValue.status = status;
    existingData.push(fetchValue);
  }

  return findplacementById;
};

const getPlaceMentsById = async (req) => {
  let placement = await Placement.findById(req.params.id);
  if (!placement) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'PlaceMent Not Found');
  }

  let studentsId = [];

  if (placement.students.length > 0) {
    placement.students.map((e) => {
      studentsId.push(e.id);
    });
  }

  let getStudents = await Students.aggregate([
    {
      $match: {
        _id: { $in: studentsId },
      },
    },
  ]);
  return getStudents;
};

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
