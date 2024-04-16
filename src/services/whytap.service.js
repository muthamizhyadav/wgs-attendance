const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { Admin, Students, Placement, PlacementDetails } = require('../models/whytap.model');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const { pipeline } = require('nodemailer/lib/xoauth2');

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
    let val = { id: e, status:"Pending" };
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
  let students = req.body.students ? req.body.students : [];

  if (students.length == 0) {
    findplacement = await Placement.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true });
    return findplacement;
  } else {
    const currentTimestamp = Date.now();

    // let students = req.body.students;
    let existArr = findplacement.students;
    let stds = [];
    students.map((e) => {
      let val = { id: e, _id: currentTimestamp.toString(), status: 'Pending' };
      stds.push(val);
    });
    let mergeArra = existArr.concat(stds);
    console.log(mergeArra);
    findplacement = await Placement.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true });
    findplacement.students = mergeArra;
    findplacement.save();
    return findplacement;
  }
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
    await PlacementDetails.create({ placementId: placementId, studentId: studentId, status: status });
    let ind = findplacementById.students.findIndex((a) => a.id === studentId);
    let fetchValue = findplacementById.students.find((e) => e.id === studentId);
    let removed = existingData.splice(ind, 1);
    fetchValue.status = status;
    existingData.push(fetchValue);
  }

  return findplacementById;
};

const getPlaceMentsById = async (req) => {
  let id = req.params.id;
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
    {
      $lookup: {
        from: 'placementdetails',
        localField: '_id',
        foreignField: 'studentId',
        pipeline: [{ $match: { placementId: id } }, { $sort: { createdAt: -1 } }, { $limit: 1 }],
        as: 'status',
      },
    },
    {
      $unwind: { path: '$status', preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 1,
        status: { $ifNull: ['$status.status', 'Pending'] },
        active: 1,
        name: 1,
        email: 1,
        phone: 1,
        batch: 1,
        course: 1,
      },
    },
  ]);
  return getStudents;
};

const getPlaceMentsByStudents = async (req) => {
  let val = await Placement.aggregate([
    {
      $match: { students: { $elemMatch: { id: req.params.id } } },
    },
    {
      $lookup: {
        from: 'placementdetails',
        localField: '_id',
        foreignField: 'placementId',
        as: 'place',
      },
    },
    {
      $unwind: { path: '$place', preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 1,
        companyName: 1,
        jobTitle: 1,
        location: 1,
        companyAddress: 1,
        interviewDate: 1,
        status: { $ifNull: ['$place.status', 'Pending'] },
      },
    },
  ]);
  return val;
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
  getPlaceMentsByStudents,
};
