const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { Admin, Students, Placement, PlacementDetails, Batch, Course, Company } = require('../models/whytap.model');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const { pipeline } = require('nodemailer/lib/xoauth2');
const mongoose = require('mongoose');
const { locales } = require('validator/lib/isIBAN');


const createWhyTapAdmin = async (req) => {
  const { password } = req.body;
  let hashPassword = await bcrypt.hash(password, 8);
  let creations = await Admin.create({ ...req.body, ...{ password: hashPassword } });
  return creations;
};

const getBatch = async (req) => {
  const getbatch = await Batch.aggregate([
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: 'batchId',
        as: 'students'
      },
    },
    {
      $project: {
        batchname: 1,
        createdAt: 1,
        totalBatchStudent: { $size: '$students' }
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ])
  return getbatch;
};
const getCompany = async (req) => {
  const getCompany = await Company.find().sort({ createdAt: -1 });
  return getCompany;
};

const getCourse = async (req) => {
  const getcourse = await Course.find().sort({ createdAt: -1 });
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
              pipeline: [
                {
                  $lookup: {
                    from: "companies",
                    localField: "companyId",
                    foreignField: "_id",
                    as: "companyDetails"
                  }
                },
                {
                  $unwind: {
                    preserveNullAndEmptyArrays: true,
                    path: "$companyDetails"
                  }
                },
                {
                  $project: {
                    _id: 1,
                    companyname: '$companyDetails.companyname',
                    interviewDate: 1,
                    jobTitle: 1,
                    location: '$companyDetails.location',
                    companyAddress: 1,
                  }
                }
              ],
              as: "company"
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
              companyName: '$company.companyname',
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
        parentname: 1,
        gender: 1,
        city: 1,
        state: 1,
        country: 1,
        createdAt: 1
      },
    },
    {
      $sort: { createdAt: -1 }
    }
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
            $lookup: {
              from: 'batches',
              localField: 'student.batchId',
              foreignField: "_id",
              as: "batch"
            }
          },
          {
            $unwind: { preserveNullAndEmptyArrays: true, path: '$batch' }
          },
          {
            $lookup: {
              from: "courses",
              localField: "student.courseId",
              foreignField: "_id",
              as: 'course'
            }
          },
          {
            $unwind: { preserveNullAndEmptyArrays: true, path: '$course' }
          },
          {
            $project: {
              _id: 1,
              status: 1,
              studentId: 1,
              studentName: '$student.name',
              batch: '$batch.batchname',
              course: '$course.coursename',
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
        jobdescription: 1,
        placements: '$placements',
        students: 1,
        createdAt: 1
      },
    },
    {
      $sort: { createdAt: -1 }
    }
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
  console.log(req.body);
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

const deleteCompany = async (req) => {
  let delCompany = await Company.findByIdAndDelete(req.params.id)
  if (!delCompany) {

  }
}

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

const DeleteDataWithIdandMenu = async (req) => {
  const { id, menu } = req.params
  console.log(id)
  if (menu == 'student') {
    let val = await Students.findByIdAndDelete(id)
    await PlacementDetails.deleteMany({ studentId: id })
    return val;
  } else if (menu == 'company') {
    return await Company.findByIdAndDelete(id)
  } else if (menu == 'interview') {
    await PlacementDetails.deleteMany({ placementId: id })
    return await Placement.findByIdAndDelete(id)
  } else if (menu == 'course') {
    return await Course.findByIdAndDelete(id)
  } else if (menu == 'batch') {
    return await Batch.findByIdAndDelete(id)
  } else {
    return { message: "Error" }
  }
}

const DashboardCounts = async (req) => {
  const studentsNumber = await Students.countDocuments();
  const interviewNumbers = await Placement.countDocuments();
  const selectedStudents = await PlacementDetails.countDocuments({ status: "Selected" })
  const notSelectedStudents = await PlacementDetails.aggregate([{
    $match: {
      status: { $ne: 'Selected' },
    }
  }, {
    $group: {
      _id: "$studentId"
    }
  }])
  console.log(notSelectedStudents);
  return {
    studentNumber: studentsNumber,
    interviewNumbers: interviewNumbers,
    selectedStudents: selectedStudents,
    notSelectedStudents: notSelectedStudents.length
  };
}

const getPlacedStudentsList = async (req, res) => {
  const placedStudents = await PlacementDetails.aggregate([
    {
      $match: { status: 'Selected' }
    },
    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "_id",
        as: "studentDetails"
      }
    },
    {
      $unwind: { path: "$studentDetails", preserveNullAndEmptyArrays: true }
    },
    {
      $lookup: {
        from: "batches",
        localField: "studentDetails.batchId",
        foreignField: "_id",
        as: "batchDetails"
      }
    },
    {
      $unwind: { path: "$batchDetails", preserveNullAndEmptyArrays: true }
    },
    {
      $lookup: {
        from: "courses",
        localField: "studentDetails.courseId",
        foreignField: "_id",
        as: "courseDetails"
      }
    },
    {
      $unwind: { path: "$courseDetails", preserveNullAndEmptyArrays: true }
    },
    {
      $lookup: {
        from: "placements",
        localField: "placementId",
        foreignField: "_id",
        as: "placementDetails"
      }
    },
    {
      $unwind: { path: "$placementDetails", preserveNullAndEmptyArrays: true }
    },
    {
      $lookup: {
        from: "companies",
        localField: "placementDetails.companyId",
        foreignField: "_id",
        as: "companyDetails"
      }
    },
    {
      $unwind: { path: "$companyDetails", preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        _id: 1,
        placementId: 1,
        student_id: "$studentDetails._id",
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        companyName: "$companyDetails.companyname",
        batchName: "$batchDetails.batchname",
        courseName: "$courseDetails.coursename",
        studentName:"$studentDetails.name"
      }
    }
  ]);

  return (placedStudents);
};


const getBatchStudents = async (req) => {
  console.log(req.query.batchId);
  const students = await Students.aggregate([
    {
      $match: { batchId: req.query.batchId }
    },
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course"
      },
    },
    {
      $unwind: { path: "$course", preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        phone: 1,
        batchId: 1,
        dob: 1,
        gender: 1,
        parentname: 1,
        linkedinUrl: 1,
        githubUrl: 1,
        courseId: 1,
        address: 1,
        city: 1,
        state: 1,
        country: 1,
        parentContact: 1,
        status: 1,
        active: 1,
        createdAt: 1,
        updatedAt: 1,
        coursename: "$course.coursename"
      }
    }
  ]);
  return students;
};


const getBatchStudentChart = async (req) => {
  console.log()
}

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
  DeleteDataWithIdandMenu,
  DashboardCounts,
  getBatchStudents,
  getPlacedStudentsList
};
