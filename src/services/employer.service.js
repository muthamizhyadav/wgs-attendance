const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { Employer, Attendance } = require('../models/employer.model');
const moment = require('moment');
const { pipeline } = require('nodemailer/lib/xoauth2');
const { aggregate } = require('../models/token.model');

const createEmployer = async (req) => {
  let body = req.body;
  let findbyEmpId = await Employer.findOne({ empId: body.empId });
  if (findbyEmpId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Employee Id Already Exist');
  }
  let findbymail = await Employer.findOne({ email: body.email });
  if (findbymail) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Employee E-mail Already Exist');
  }
  let findbyphone = await Employer.findOne({ phone: body.phone });
  if (findbyphone) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Employee Phone Number Already Exist');
  }
  let creation = await Employer.create(body);
  return creation;
};

const getAllEmployer = async (req) => {
  const { dept, date, name } = req.query;
  console.log(req.query);

  let deptSearch = { active: true };
  let nameSearch = { active: true };

  if (dept && dept != 'null' && dept != '' && dept != null) {
    deptSearch = { department: { $regex: dept, $options: 'i' } };
  }

  if (name && name != 'null' && name != '' && name != null) {
    nameSearch = {
      empName: { $regex: name, $options: 'i' },
    };
  }
  let currentDate = moment().format('YYYY-MM-DD');
  if (date && date != 'null' && date != '' && date != null) {
    currentDate = date;
  }
  // console.log(currentDate);
  const getEmpl = await Employer.aggregate([
    {
      $match: {
        $and: [deptSearch, nameSearch],
      },
    },
    {
      $lookup: {
        from: 'attendances',
        localField: '_id',
        foreignField: 'empId',
        pipeline: [{ $match: { date: currentDate } }],
        as: 'attendance',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$attendance',
      },
    },
    {
      $project: {
        _id: 1,
        attendanceId: { $ifNull: ['$attendance._id', null] },
        att: { $ifNull: ['$attendance.leavetype', 'Present'] },
        empName: 1,
        empId: 1,
        email: 1,
        phone: 1,
        dataOfBirth: 1,
        gender: 1,
        dateOfJoining: 1,
        designation: 1,
        department: 1,
        head: 1,
      },
    },
  ]);
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

const getEmployeeById = async (req) => {
  let findEmp = await Employer.findById(req.params.id);
  if (!findEmp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Employer Not Found');
  }
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

const getEmployerById = async (req) => {
  let { month } = req.query;
  let id = req.params.id;

  const date = new Date();
  let monthName = date.toLocaleString('default', { month: 'long' });
  let monthMatch = { month: monthName };
  if (month && month != 'null' && month != '' && month != null) {
    monthMatch = { month: { $regex: month, $options: 'i' } };
    monthName = month;
  } else {
    monthMatch = { month: { $regex: monthName, $options: 'i' } };
  }

  let findEmp = await Employer.aggregate([
    { $match: { _id: id } },
    {
      $lookup: {
        from: 'attendances',
        localField: '_id',
        foreignField: 'empId',
        pipeline: [{ $match: { $and: [monthMatch] } }, { $group: { _id: null, total: { $sum: '$attendance' } } }],
        as: 'monthlyleave',
      },
    },
    {
      $lookup: {
        from: 'attendances',
        localField: '_id',
        foreignField: 'empId',
        pipeline: [
          { $match: { $and: [monthMatch, { leavetype: 'Casual Leave' }] } },
          { $group: { _id: null, total: { $sum: '$attendance' } } },
        ],
        as: 'casualleave',
      },
    },
    {
      $lookup: {
        from: 'attendances',
        localField: '_id',
        foreignField: 'empId',
        pipeline: [{ $match: { $and: [monthMatch] } }, { $group: { _id: null, total: { $sum: '$attendance' } } }],
        as: 'totalleave',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$totalleave',
      },
    },
    {
      $lookup: {
        from: 'attendances',
        localField: '_id',
        foreignField: 'empId',
        pipeline: [
          { $match: { $and: [monthMatch, { leavetype: 'Sick Leave' }] } },
          { $group: { _id: null, total: { $sum: '$attendance' } } },
        ],
        as: 'totalsickleave',
      },
    },
    {
      $lookup: {
        from: 'attendances',
        localField: '_id',
        foreignField: 'empId',
        pipeline: [{ $match: { $and: [monthMatch, { leavetype: 'Week off' }] } }],
        as: 'Weekoffleave',
      },
    },
    {
      $lookup: {
        from: 'attendances',
        localField: '_id',
        foreignField: 'empId',
        pipeline: [{ $match: { $and: [monthMatch, { leavetype: 'Half day' }] } }],
        as: 'halfleave',
      },
    },
    {
      $lookup: {
        from: 'attendances',
        localField: '_id',
        foreignField: 'empId',
        pipeline: [{ $match: { $and: [monthMatch, { leavetype: 'Late' }] } }],
        as: 'Late',
      },
    },
    {
      $project: {
        _id: 1,
        empName: 1,
        empId: 1,
        email: 1,
        phone: 1,
        dataOfBirth: 1,
        dateOfJoining: 1,
        gender: 1,
        designation: 1,
        department: 1,
        head: 1,
        monthlyLeave: { $size: '$monthlyleave.total' },
        sickleave: { $size: '$totalsickleave' },
        casualLeave: { $size: '$casualleave' },
        Weekoffleave: { $size: '$Weekoffleave' },
        halfleave: { $size: '$halfleave' },
        Late: { $size: '$Late' },
        totalleave: { $ifNull: ['$totalleave.total', 0] },
        sickandcasulaLeaves: { $ifNull: [{ $add: [{ $size: '$totalsickleave' }, { $size: '$casualleave' }] }, 0] },
        leaveLate: {
          $cond: {
            if: { $gt: [{ $size: '$Late' }, 3] },
            then: {
              $cond: {
                if: { $gt: [{ $subtract: [{ $divide: [{ $size: '$Late' }, 2] }, 1] }, 0] },
                then: { $subtract: [{ $divide: [{ $size: '$Late' }, 2] }, 1] },
                else: 0,
              },
            },
            else: 0,
          },
        },
        sickCasualmin: {
          $cond: {
            if: { $gt: [{ $ifNull: [{ $add: [{ $size: '$totalsickleave' }, { $size: '$casualleave' }] }, 0] }, 2] },
            then: {
              $cond: {
                if: {
                  $gt: [
                    {
                      $subtract: [
                        {
                          $divide: [
                            { $ifNull: [{ $add: [{ $size: '$totalsickleave' }, { $size: '$casualleave' }] }, 0] },
                            2,
                          ],
                        },
                        1,
                      ],
                    },
                    0,
                  ],
                },
                then: {
                  $subtract: [
                    { $divide: [{ $ifNull: [{ $add: [{ $size: '$totalsickleave' }, { $size: '$casualleave' }] }, 0] }, 2] },
                    1,
                  ],
                },
                else: 0,
              },
            },
            else: 0,
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        empName: 1,
        empId: 1,
        phone: 1,
        email: 1,
        dataOfBirth: 1,
        dateOfJoining: 1,
        gender: 1,
        department: 1,
        designation: 1,
        head: 1,
        monthlyLeave: 1,
        sickleave: 1,
        casualLeave: 1,
        Weekoffleave: 1,
        halfleave: 1,
        Late: 1,
        totalleave: 1,
        sickandcasulaLeaves: 1,
        leaveLate: 1,
        // sickCasualmin:1,
        LOP: { $add: ['$sickCasualmin', '$leaveLate'] },
      },
    },
  ]);
  return findEmp;
};

// Attendance ManageMents Api's
const Addattendance_EveryDay = (req) => {
  const date = new Date();
  let monthName = date.toLocaleString('default', { month: 'long' });
  let currentDate = moment().format('YYYY-MM-DD');
  return new Promise((resolve, reject) => {
    let body = req.body;
    let createAttPromises = body.map((element) => {
      return Attendance.create(element);
    });

    Promise.all(createAttPromises)
      .then(() => {
        resolve({ message: 'Attendance records created successfully.' });
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

const gettodayReportCounts = async (req) => {
  let today = moment().format('YYYY-MM-DD');
  const { date } = req.query;
  if (date && date != 'null' && date != '' && date != null) {
    today = date;
  }
  let values = await Attendance.aggregate([
    { $match: { date: today } },
    {
      $group: {
        _id: '$leavetype',
        leaves: { $push: '$$ROOT' },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        name: '$_id',
        counts: { $size: '$leaves' },
      },
    },
  ]);
  let employers = await Employer.find().count();
  let absentiesCalc = await Attendance.aggregate([
    {
      $match: { date: today, leavetype: { $in: ['Absent', 'Casual Leave', 'Sick Leave'] } },
    },
  ]);
  let absenties = absentiesCalc.length == 0 ? 0 : absentiesCalc.length;
  return { values: values, employer: employers, present: employers - absenties };
};

module.exports = {
  createEmployer,
  getAllEmployer,
  updateEmployerById,
  deleteEmployerById,
  Addattendance_EveryDay,
  updateAttendance,
  getAttendance,
  getEmployerById,
  gettodayReportCounts,
  getEmployeeById,
};
