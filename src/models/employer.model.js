const mongoose = require('mongoose');
const { v4 } = require('uuid');

const EmployerSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    empName: String,
    empId: String,
    dateOfJoining: String,
    gender: String,
    designation: String,
    department: String,
    head: String,
    active: {
      type: Boolean,
      default: v4,
    },
  },
  { timestamps: true }
);

const EmployerAttendance = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    attendance: String,
    empId: String,
    leavetype: String,
    reason: String,
    date: String,
    month: String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Employer = mongoose.model('employers', EmployerSchema);
const Attendance = mongoose.model('employers', EmployerAttendance);

module.exports = {
  Employer,
  Attendance,
};
