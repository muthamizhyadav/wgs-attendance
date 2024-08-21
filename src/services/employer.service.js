const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { Employer, Attendance, CompOff, Permission, Event } = require('../models/employer.model');
const moment = require('moment');
const { pipeline } = require('nodemailer/lib/xoauth2');
const { aggregate } = require('../models/token.model');
const { log } = require('winston');
const { Console } = require('winston/lib/winston/transports');
const xlsx = require('xlsx');

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
  let findbyOfmail = await Employer.findOne({ profEmail: body.profEmail });
  if (findbyOfmail) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Employee official E-mail Already Exist');
  }
  let findbyphone = await Employer.findOne({ phone: body.phone });
  if (findbyphone) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Employee Phone Number Already Exist');
  }
  let findbyAlphone = await Employer.findOne({ alternatePhone: body.alternatePhone });
  if (findbyAlphone) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Employee Alternate Phone Number Already Exist');
  }
  let creation = await Employer.create(body);
  // console.log(creation,req.body);
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
const getAllEmployerAtten = async (req) => {
  const { dept, date, name, atten } = req.query;
  console.log(req.query, 'query');
  let deptSearch = { active: true };
  let nameSearch = { active: true };
  let attenSearch = { active: true };

  if (dept && dept != 'null' && dept != '' && dept != null) {
    deptSearch = { department: { $regex: dept, $options: 'i' } };
  }

  if (name && name != 'null' && name != '' && name != null) {
    nameSearch = {
      empName: { $regex: name, $options: 'i' },
    };
  }
  if (atten && atten != 'null' && atten != '' && atten != null) {
    console.log('if');
    // attenSearch = {$regex:atten, $options:'i'}
    attenSearch = { att: { $regex: atten, $options: 'i' } };
  } else {
    console.log('else');
  }
  console.log(atten, 'atten');
  let currentDate = moment().format('YYYY-MM-DD');
  if (date && date != 'null' && date != '' && date != null) {
    currentDate = date;
  }
  console.log(currentDate, 'ssd');
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
        pipeline: [{ $match: { $and: [{ date: currentDate }] } }],
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
        attendanceDate: '$attendance.date',
        active: 1,
      },
    },

    {
      $match: attenSearch,
    },
  ]);
  console.log(getEmpl, 'atten');
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
  let { month } = req.body;
  let id = req.params.id;

  const date = new Date();

  let monthName = date.toLocaleString('default', { month: 'long' });
  let monthMatch = { month: monthName };
  console.log(monthMatch, 'month');
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
          { $group: { _id: null, total: { $sum: 1 } } },
        ],
        as: 'casualleave',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$casualleave',
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
          { $group: { _id: null, total: { $sum: 1 } } },
        ],
        as: 'totalsickleave',
      },
    },
    {
      $unwind: { preserveNullAndEmptyArrays: true, path: '$totalsickleave' },
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
      $lookup: {
        from: 'attendances',
        localField: '_id',
        foreignField: 'empId',
        pipeline: [{ $match: { $and: [monthMatch, { leavetype: 'Absent' }] } }],
        as: 'absent',
      },
    },
    {
      $lookup: {
        from: 'attendances',
        localField: '_id',
        foreignField: 'empId',
        pipeline: [{ $match: { $and: [monthMatch, { leavetype: 'Holiday' }] } }],
        as: 'holiday',
      },
    },
    {
      $lookup: {
        from: 'attendances',
        localField: '_id',
        foreignField: 'empId',
        pipeline: [{ $match: { $and: [monthMatch, { leavetype: 'Comp Off' }] } }],
        as: 'compOff',
      },
    },
    {
      $lookup: {
        from: 'attendances',
        localField: '_id',
        foreignField: 'empId',
        pipeline: [{ $match: { $and: [monthMatch, { leavetype: 'Work from home' }] } }],
        as: 'wfh',
      },
    },
    // {
    //   $lookup:{
    //     from:'compoff',
    //     localField:'_id',
    //     foreignField: 'empId',
    //     pipeline: { $match: { empId: id } },
    //     as:'compoff'
    //   }
    // },

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
        // compOff:{$size:'$compoff'},
        monthlyLeave: { $size: '$monthlyleave.total' },
        sickleave: { $ifNull: ['$totalsickleave.total', 0] },
        casualLeave: { $ifNull: ['$casualleave.total', 0] },

        Weekoffleave: { $size: '$Weekoffleave' },
        halfleave: { $size: '$halfleave' },
        Late: { $size: '$Late' },

        holiday: { $size: '$holiday' },
        compOff: { $size: '$compOff' },
        wfh: { $size: '$wfh' },
        totalleave: { $ifNull: ['$totalleave.total', 0] },
        absent: { $size: '$absent' },
        sickandcasulaLeaves: { $add: ['$totalsickleave.total', '$casualleave.total'] },
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

        sickCasualDetection: {
          $cond: {
            if: { $gte: [{ $add: ['$totalsickleave.total', '$casualleave.total'] }, 2] },
            then: { $subtract: [{ $add: ['$totalsickleave.total', '$casualleave.total'] }, 2] },
            else: 0,
          },
        },

        // sickCasualmin: {
        //   $cond: {
        //     if: { $gt: [{ $ifNull: [{ $add: ['$totalsickleave.total',  '$casualleave.total' ] }, 0] }, 2] },
        //     then: {
        //       $cond: {
        //         if: {
        //           $gt: [
        //             {
        //               $subtract: [
        //                 {
        //                   $divide: [
        //                     { $ifNull: [{ $add: ['$totalsickleave.total', '$casualleave.total'] }, 0] },
        //                     2,
        //                   ],
        //                 },
        //                 2,
        //               ],
        //             },
        //             0,
        //           ],
        //         },
        //         then: {
        //           $subtract: [
        //             { $divide: [{ $ifNull: [{ $add: ['$totalsickleave.total','$casualleave.total' ] }, 0] }, 2] },
        //             1,
        //           ],
        //         },
        //         else: 0,
        //       },
        //     },
        //     else: 0,
        //   },
        // }
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
        holiday: 1,
        compOff: 1,
        wfh: 1,
        casualLeave: 1,
        Weekoffleave: 1,
        halfleave: { $divide: ['$halfleave', 2] },
        Late: 1,
        totalleave: 1,
        sickandcasulaLeaves: 1,
        leaveLate: 1,
        // sickCasualmin:1,
        sickCasualDetection: 1,
        absent: 1,
        LOP: { $add: ['$sickCasualDetection', '$leaveLate', '$absent'] },
      },
    },
  ]);
  let findComp = { compOff: (await CompOff.find({ empId: id, active: true }).count()) || 0 };

  findEmp = { ...findComp, ...findEmp };
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
  console.log(today, 'TODAY');

  let values = await Attendance.aggregate([
    {
      $match: {
        $and: [
          {
            date: { $gte: today },
          },
          {
            date: { $lte: today },
          },
        ],
      },
    },
    {
      $group: {
        _id: '$leavetype',
        count: { $sum: 1 },
      },
    },

    {
      $facet: {
        originalData: [{ $project: { leavetype: '$_id', count: 1 } }],
        allStatuses: [
          {
            $project: {
              statuses: ['Casual Leave', 'Sick Leave', 'Work from home', 'Compoff'],
            },
          },
        ],
      },
    },
    {
      $project: {
        combined: {
          $map: {
            input: { $arrayElemAt: ['$allStatuses.statuses', 0] },
            as: 'status',
            in: {
              status: '$$status',
              count: {
                $let: {
                  vars: {
                    matchingStatus: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$originalData',
                            as: 'item',
                            cond: { $eq: ['$$item.leavetype', '$$status'] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: { $ifNull: ['$$matchingStatus.count', 0] },
                },
              },
            },
          },
        },
      },
    },
  ]);
  console.log(values, 'VAL');

  let val = values[0].combined;

  let counts;

  if (val) {
    const result = val.reduce((acc, item) => {
      const key = item.status.replace(/\s+/g, '');
      acc[key] = item.count;
      return acc;
    }, {});

    counts = result;
  } else {
    counts = {
      CasualLeave: 0,
      Compoff: 0,
      Halfday: 0,
      Late: 0,
      Permission: 0,
      SickLeave: 0,
      Workfromhome: 0,
    };
  }

  let employers = await Employer.find().count();
  let absentiesCalc = await Attendance.aggregate([
    {
      $match: { date: today, leavetype: { $in: ['Absent', 'Casual Leave', 'Sick Leave'] } },
    },
  ]);
  let absenties = absentiesCalc.length == 0 ? 0 : absentiesCalc.length;
  return { values: counts, employer: employers, present: employers - absenties };
};
const getWeekoffById = async (req) => {
  let { id } = req.query;
  let data = await Attendance.aggregate([
    { $match: { empId: id } },
    {
      $project: {
        _id: 1,
        date: 1,
        leavetype: 1,
      },
    },
    { $match: { $or: [{ leavetype: 'Week off' }, { leavetype: 'Holiday' }] } },
  ]);
  return data;
};
const createCompOff = async (req) => {
  let { weekOffId, date, empId, leavetype } = req.body;

  let findOgId = await Attendance.aggregate([
    { $match: { $and: [{ empId: empId }, { _id: weekOffId }, { leavetype: { $in: ['Week off', 'Holiday'] } }] } },
    {
      $project: {
        _id: 1,
        date: 1,
        leavetype: 1,
      },
    },
  ]);
  console.log(findOgId);
  if (!findOgId.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Id for compoff !');
  }
  let findId = await CompOff.find({ weekOffId: weekOffId });
  if (findId.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Comp Off already exists for this date');
  }
  let createCompOff = await new CompOff({
    weekOffId: weekOffId,
    weekOffDate: date,
    compOff: 1,
    empId: empId,
    leavetype: leavetype,
  });
  createCompOff.save();
  return createCompOff;
};
const getCompOffById = async (req) => {
  const id = req.params.id;
  let findCompOff = await CompOff.aggregate([
    { $match: { $and: [{ empId: id }, { active: true }] } },
    {
      $project: {
        leavetype: 1,
        _id: 1,
        weekOffDate: 1,
        weekOffId: 1,
      },
    },
  ]);
  return findCompOff;
};
const deductCompOff = async (req) => {
  const { empId, date } = req.body;
  const id = req.params.id;
  let data = {
    active: false,
    compOff: 0,
    alternateDate: date,
  };
  let changeCompOff = await CompOff.findByIdAndUpdate({ _id: id }, data, { new: true });
  return changeCompOff;
};
const getEmployeeStatusById = async (req) => {
  console.log('dsffsfsd');
  const { date, id } = req.body;
  const getStatus = await Attendance.find({ empId: id, date: date });
  console.log(getStatus, date, id);
  if (getStatus.length == 0) {
    return [{ leavetype: 'Present' }];
  } else {
    return getStatus;
  }
};

const createPermission = async (req) => {
  let { empId, date, month, year, fromTime, toTime, duration } = req.body;
  let permissionCount = await Permission.findOne({ empId: empId, month: month }).countDocuments();
  console.log(permissionCount);
  if (permissionCount >= 2) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Already two permissions granted');
  }
  let newPermission = await new Permission({
    empId: empId,
    date: date,
    month: month,
    year: year,
    fromTime: fromTime,
    toTime: toTime,
    duration: duration,
  });
  newPermission.save();

  return newPermission;
};

const getPermissionStatus = async (req) => {
  let { empId, date } = req.body;
  console.log(empId, date);

  const newDate = new Date(date);

  let monthName = newDate.toLocaleString('default', { month: 'long' });
  console.log(monthName, 'month');
  // const findPerm = await Permission.aggregate([
  //   {
  //     $match:{
  //     empId:empId,
  //     date: date,
  //     }
  //   },{
  //     $lookup:{
  //       from:'attendances',
  //       localField:'empId',
  //       foreignField:'empId',
  //       pipeline: [{ $match: { date: date } }],
  //       as:"attendances"
  //     }
  //   },
  //   {
  //     $project:{
  //       empId: 1,
  //       date: 1,
  //       month: 1,
  //      leavetype:'attendances.leavetype',

  //     }
  //   }
  // ])
  const findAtten = await Attendance.aggregate([
    {
      $match: {
        empId: empId,
        date: date,
        month: monthName,
      },
    },
    {
      $lookup: {
        from: 'permissions',
        localField: 'empId',
        foreignField: 'empId',
        pipeline: [{ $match: { date: date } }],
        as: 'permissions',
      },
    },
    {
      $project: {
        empId: 1,
        date: 1,
        month: 1,
        leavetype: 1,
        permissionStatus: {
          $cond: {
            if: { $gt: [{ $size: '$permissions' }, 0] },
            then: 'Permission taken',
            else: 'No permission taken',
          },
        },
      },
    },
  ]);

  return findAtten;
};
const getPermission = async (req) => {
  const { month, empId } = req.body;

  // const newDate = new Date(date);

  // let monthName = newDate.toLocaleString('default', { month: 'long' });
  // console.log(monthName,'month');
  const permissions = await Permission.find({ month: month, empId: empId });

  return permissions;
};
const updatePermission = async (req) => {
  let { id } = req.params;
  const permission = await Permission.findByIdAndUpdate({ _id: id }, req.body, { new: true });
  return permission;
};
const deletePermission = async (req) => {
  let { id } = req.params;
  console.log(id, 'id');
  // id = id.toString()
  const permission = await Permission.findByIdAndDelete({ _id: id });
  return permission;
};

const EmployerBulkUpload = async (req) => {
  if (req.file) {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet_name_list = workbook.SheetNames;
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    return new Promise((resolve, reject) => {
      let updates = [];
      data.forEach(async (e) => {
        try {
          let creation = await Employer.create(e);
          updates.push(creation);
          if (data.length === updates.length) {
            resolve(updates);
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  }
};

const createEventsByHr = async (req) => {
  let body = req.body;
  let val = await Event.create(body);
  return val;
};

const getEvents = async (req) => {
  let values = await Event.aggregate([
    {
      $match: {
        active: true,
      },
    },
    {
      $project: {
        _id: 0,
        title: 1,
        date: '$date',
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
  getEmployerById,
  gettodayReportCounts,
  getEmployeeById,
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
};
