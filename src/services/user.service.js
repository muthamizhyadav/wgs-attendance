const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { Employer, Attendance, Event } = require('../models/employer.model');
const { payslip } = require('../utils/payslip.const');
const bcrypt = require('bcryptjs');
/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email, password) => {
  let HR = await User.findOne({ email });
  if (HR) {
    return HR;
  } else {
    let staffOrHead = await Employer.findOne({ email });
    if (!staffOrHead) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Inavalid credential's");
    }
    if (staffOrHead.passwordUpdated == true) {
      if (staffOrHead.password != password) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Inavalid password');
      }
    } else {
      let splitDOB = staffOrHead.dataOfBirth.split('.');
      const joinedString = splitDOB.join(' ');
      if (joinedString == password) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Inavalid password');
      }
    }

    return staffOrHead;
  }
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

const getHeads = async () => {
  const heads = await Employer.find({ head: true });
  return heads;
};

const LeaveRequest = async (req) => {
  const userId = req.userId;
  let findEmp = await Employer.findById(userId);
  if (!findEmp) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Employee not found');
  }
  const { headId } = findEmp;
  console.log(findEmp, 'JIJI', headId);

  let datas = {
    leavetype: req.body.leavetype,
    reason: req.body.leavetype,
    date: req.body.date,
    toDate: req.body.toDate,
    headId: findEmp ? findEmp.headId : '',
    empId: findEmp._id,
  };
  let creation = await Attendance.create(datas);
  return creation;
};

const HrLeave = async (req) => {
  const userId = req.params.id;
  let findEmp = await Employer.findById(userId);
  if (!findEmp) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Employee not found');
  }
  console.log(findEmp, 'ASASAS');

  let datas = {
    leavetype: req.body.leavetype,
    reason: req.body.leavetype,
    date: req.body.date,
    toDate: req.body.toDate,
    headId: findEmp ? findEmp.headId : '',
    empId: findEmp._id,
    Status: req.body.Status,
  };
  let creation = await Attendance.create(datas);
  return creation;
};

const MyLeaveRequest = async (req) => {
  const userId = req.userId;
  let leaveRequests = await Attendance.aggregate([
    {
      $match: {
        empId: userId,
      },
    },
  ]);
  return leaveRequests;
};

const getHeadTeamDetails = async (req) => {
  const userId = req.userId;
  let findEmplyersByHead = await Employer.find({ headId: userId });
  let values = await Attendance.aggregate([
    {
      $match: {
        headId: userId,
      },
    },
    {
      $group: {
        _id: '$Status',
        count: { $sum: 1 },
      },
    },
    {
      $facet: {
        originalData: [{ $project: { Status: '$_id', count: 1 } }],
        allStatuses: [
          {
            $project: {
              statuses: ['Pending', 'Approved', 'Rejected'],
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
                            cond: { $eq: ['$$item.Status', '$$status'] },
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

  let datas = {
    leaves: values[0].combined,
    teamMates: findEmplyersByHead,
  };

  return datas;
};

const HeadRequests = async (req) => {
  let myRequest = await MyLeaveRequest(req);
  let details = await getHeadTeamDetails(req);
  let headId = req.userId;
  let headRequests = await Attendance.aggregate([
    {
      $match: {
        headId,
      },
    },
    {
      $lookup: {
        from: 'employers',
        localField: 'empId',
        foreignField: '_id',
        as: 'Emp',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$Emp',
      },
    },
    {
      $project: {
        _id: 1,
        Status: 1,
        active: 1,
        createdAt: 1,
        date: 1,
        empId: 1,
        headId: 1,
        leavetype: 1,
        reason: 1,
        toDate: 1,
        updatedAt: 1,
        empName: '$Emp.empName',
      },
    },
  ]);
  return { myRequest, headRequests, details };
};

const leaveRequestsHR = async () => {
  let Requests = await Attendance.aggregate([
    {
      $group: {
        _id: '$Status',
        count: { $sum: 1 },
      },
    },
    {
      $facet: {
        originalData: [{ $project: { Status: '$_id', count: 1 } }],
        allStatuses: [
          {
            $project: {
              statuses: ['Pending', 'Approved', 'Rejected'],
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
                            cond: { $eq: ['$$item.Status', '$$status'] },
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

  let EmpRequests = await Attendance.aggregate([
    {
      $lookup: {
        from: 'employers',
        localField: 'empId',
        foreignField: '_id',
        as: 'Emp',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$Emp',
      },
    },
    {
      $project: {
        _id: 1,
        Status: 1,
        active: 1,
        createdAt: 1,
        date: 1,
        empId: 1,
        headId: 1,
        leavetype: 1,
        reason: 1,
        toDate: 1,
        updatedAt: 1,
        empName: '$Emp.empName',
        LeaveBy: { $ifNull: ['$LeaveBy', 'nil'] },
      },
    },
  ]);

  let data = {
    leaves: Requests[0].combined,
    empRequests: EmpRequests,
  };

  return data;
};

const UpdateRequest = async (req) => {
  let id = req.params.id;
  let update = req.body;

  let findAttendanceById = await Attendance.findById(id);
  if (!findAttendanceById) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Attendace not found');
  }
  await Event.create({ userId: findAttendanceById.empId, title: findAttendanceById.leavetype, date: findAttendanceById.date });
  findAttendanceById = await Attendance.findByIdAndUpdate({ _id: id }, update, { new: true });
  return findAttendanceById;

  // LeaveBy
};

const getDetailsForPaySlip = async (req) => {
  let userId = req.userId;
  const { pf, esi, basic, hra, Conveyance, OtherAllowance } = payslip;
  let findEmployerById = await Employer.findById(userId);
  if (!findEmployerById) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Employer not found');
  }

  let employer = await Employer.aggregate([
    {
      $match: {
        _id: userId,
      },
    },
    {
      $addFields: {
        basic: {
          $toString: {
            $multiply: [{ $toDouble: '$grossSalary' }, basic],
          },
        },
      },
    },

    {
      $addFields: {
        hra: {
          $toString: {
            $multiply: [{ $toDouble: '$grossSalary' }, hra],
          },
        },
      },
    },

    {
      $addFields: {
        Conveyance: {
          $toString: {
            $multiply: [{ $toDouble: '$grossSalary' }, Conveyance],
          },
        },
      },
    },
    {
      $addFields: {
        OtherAllowance: {
          $toString: {
            $multiply: [{ $toDouble: '$grossSalary' }, OtherAllowance],
          },
        },
      },
    },
    {
      $addFields: {
        Esi: {
          $toString: {
            $multiply: [{ $toDouble: '$grossSalary' }, esi],
          },
        },
      },
    },
    {
      $addFields: {
        Pf: {
          $toString: {
            $multiply: [{ $toDouble: '$grossSalary' }, pf],
          },
        },
      },
    },
  ]);
  return employer[0];
};

const getEmployerLeaveDetails = async (req) => {
  let userId = req.userId;
  let values = await Attendance.aggregate([
    {
      $match: {
        empId: userId,
        Status: { $in: ['Approved', 'Rejected', 'Absent'] },
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
              statuses: ['Late', 'Casual Leave', 'Sick Leave', 'Half day', 'Work from home', 'Permission', 'Compoff'],
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

  let val = values[0].combined;

  if (val) {
    const result = val.reduce((acc, item) => {
      const key = item.status.replace(/\s+/g, '');
      acc[key] = item.count;
      return acc;
    }, {});

    return result;
  } else {
    return {
      CasualLeave: 0,
      Compoff: 0,
      Halfday: 0,
      Late: 0,
      Permission: 0,
      SickLeave: 0,
      Workfromhome: 0,
    };
  }
};

const UpdateRequestByHR = async (req) => {
  let id = req.params.id;
  let update = req.body;
  let findAttendanceById = await Attendance.findById(id);
  if (!findAttendanceById) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Attendace not found');
  }
  await Event.create({ userId: findAttendanceById.empId, title: findAttendanceById.leavetype, date: findAttendanceById.date });
  findAttendanceById = await Attendance.findByIdAndUpdate({ _id: id }, update, { new: true });
  return findAttendanceById;
  // LeaveBy
};

const getEmployerLeaveDetailsById = async (req) => {
  let userId = req.params.id;
  let values = await Attendance.aggregate([
    {
      $match: {
        empId: userId,
        Status: { $in: ['Approved', 'Rejected', 'Absent'] },
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
              statuses: ['Late', 'Casual Leave', 'Sick Leave', 'Half day', 'Work from home', 'Permission', 'Compoff'],
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

  let val = values[0].combined;

  if (val) {
    const result = val.reduce((acc, item) => {
      const key = item.status.replace(/\s+/g, '');
      acc[key] = item.count;
      return acc;
    }, {});

    return result;
  } else {
    return {
      CasualLeave: 0,
      Compoff: 0,
      Halfday: 0,
      Late: 0,
      Permission: 0,
      SickLeave: 0,
      Workfromhome: 0,
    };
  }
};

const updatePassword = async (req) => {
  let userId = req.userId;
  let body = req.body;

  let findAlredyExist = await User.findById(userId);
  let findEmployer = await Employer.findById(userId);

  if (findAlredyExist) {
    let hashing = await bcrypt.hash(body.password, 8);
    findAlredyExist = await User.findByIdAndUpdate({ _id: userId }, { password: hashing }, { new: true });
    return findAlredyExist;
  } else {
    if (!findEmployer) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'not found');
    } else {
      findEmployer = await Employer.findByIdAndUpdate(
        { _id: userId },
        { passwordUpdated: true, password: body.password },
        { new: true }
      );
      return findEmployer;
    }
  }
};

const getUserProfile = async (req) => {
  let userId = req.userId;
  let findEmployee = await Employer.findById(userId);
  if (!findEmployee) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed');
  }
  return findEmployee;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  getHeads,
  LeaveRequest,
  MyLeaveRequest,
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
