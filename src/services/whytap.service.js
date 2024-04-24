const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { Admin, Students, Placement, PlacementDetails, Batch, Course, Company } = require('../models/whytap.model');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const { pipeline } = require('nodemailer/lib/xoauth2');

const createWhyTapAdmin = async (req) => {
  const { password } = req.body;
  let hashPassword = await bcrypt.hash(password, 8);
  let creations = await Admin.create({ ...req.body, ...{ password: hashPassword } });
  return creations;
};

const getBatch = async (req) => {
  const getbatch = await Batch.find();
  return getbatch;
};
const getCompany = async (req) => {
  const getCompany = await Company.find();
  return getCompany;
};

const getCourse = async (req) => {
  const getcourse = await Course.find();
  return getcourse;
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

const createBatch = async (req) => {
  const batch = await Batch.create(req.body);
  return batch;
};
const createCourse = async (req) => {
  const course = await Course.create(req.body);
  return course;
};

const createCompany = async (req) => {
  const company = await Company.create(req.body);
  return company;
};

const getStudent = async (req) => {
  const findAllStudents = await Students.aggregate([
    {
      $lookup: {
        from: 'placementdetails',
        localField: '_id',
        foreignField: 'studentId',
        pipeline: [
          {
            $lookup: {
              from: 'placements',
              localField: 'placementId',
              foreignField: '_id',
              as: 'company',
            },
          },
          {
            $unwind: {
              preserveNullAndEmptyArrays: true,
              path: '$company',
            },
          },
          {
            $project: {
              _id: 1,
              status: 1,
              companyName: '$company.companyName',
              interviewDate: '$company.interviewDate',
              jobTitle: '$company.jobTitle',
              location: '$company.location',
              companyAddress: '$company.companyAddress',
              studentId: 1,
            },
          },
        ],
        as: 'placementsDetails',
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'courseDetails',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$courseDetails',
      },
    },
    {
      $lookup: {
        from: 'batches',
        localField: 'batchId',
        foreignField: '_id',
        as: 'batchDetail',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$batchDetail',
      },
    },
    {
      $project: {
        _id: 1,
        active: 1,
        address: 1,
        batch: '$batchDetail.batchname',
        batchId: 1,
        course: '$courseDetails.coursename',
        courseId: 1,
        dob: 1,
        email: 1,
        githubUrl: 1,
        linkedinUrl: 1,
        name: 1,
        parentContact: 1,
        phone: 1,
        placementsDetails: 1,
        status: 1,
      },
    },
  ]);
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
  const { students, companyId } = req.body;
  const creation = await Placement.create(req.body);
  students.map(async (e) => {
    let data = {
      placementId: creation._id,
      studentId: e,
      companyId: companyId,
      status: 'Pending',
    };
    await PlacementDetails.create(data);
  });
  return creation;
};

const getplacement = async (req) => {
  const findAllplacements = await Placement.aggregate([
    {
      $lookup: {
        from: 'placementdetails',
        localField: '_id',
        foreignField: 'placementId',
        pipeline: [
          {
            $lookup: {
              from: 'students',
              localField: 'studentId',
              foreignField: '_id',
              as: 'student',
            },
          },
          {
            $unwind: { preserveNullAndEmptyArrays: true, path: '$student' },
          },
          {
            $project: {
              _id: 1,
              status: 1,
              studentId: 1,
              studentName: '$student.name',
              batch: '$student.batch',
              course: '$student.course',
              phone: '$student.phone',
            },
          },
        ],
        as: 'placements',
      },
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'companyId',
        foreignField: '_id',
        as: 'company',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$company',
      },
    },
    {
      $project: {
        companyName: '$company.companyname',
        location: '$company.location',
        companyId: 1,
        interviewDate: 1,
        jobTitle: 1,
        placements: '$placements',
        students: 1,
      },
    },
  ]);
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
    findplacement = await Placement.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true });
    students.map(async (e) => {
      await Placement.findByIdAndUpdate({ _id: req.params.id }, { $push: { students: e } }, { new: true });
      let datas = {
        placementId: req.params.id,
        studentId: e,
        status: 'Pending',
      };
      await PlacementDetails.create(datas);
    });
    return findplacement;
  }
};

const updateCandStatusInPlaceMent = async (req) => {
  const { studentId, status } = req.body;
  let findPlacementDetails = await PlacementDetails.findById(req.params.id);
  if (!findPlacementDetails) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Interview Not Scheduled');
  }
  findPlacementDetails = await PlacementDetails.findByIdAndUpdate({ _id: findPlacementDetails._id }, req.body, {
    new: true,
  });
  return findPlacementDetails;
};

const updateBatch = async (req) => {
  let findBatches = await Batch.findById(req.params.id);
  if (!findBatches) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No batch found');
  }
  findBatches = await Batch.findByIdAndUpdate({ _id: findBatches._id }, req.body, { new: true });
  return findBatches;
};

const updateCourse = async (req) => {
  let findCourse = await Course.findById(req.params.id);
  if (!findCourse) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No course found');
  }
  findCourse = await Course.findByIdAndUpdate({ _id: findCourse._id }, req.body, { new: true });
  return findCourse;
};

const updateCompany = async (req) => {
  let findCompany = await Company.findById(req.params.id);
  if (!findCompany) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No company found');
  }
  findCompany = await Company.findByIdAndUpdate({ _id: findCompany._id }, req.body, { new: true });
  return findCompany;
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
  createBatch,
  getBatch,
  updateBatch,
  updateCourse,
  getCourse,
  createCourse,
  createCompany,
  updateCompany,
  getCompany,
};
