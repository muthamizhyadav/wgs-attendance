const mongoose = require('mongoose');
const { v4 } = require('uuid');

const EmployerSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    empName: String,
    empId: {
      type: String,
      unique: true,
    },
    dateOfJoining: String,
    gender: String,
    designation: String,
    department: String,
    head: String,
    email: {
      type: String,
      unique: true,
    },
    dataOfBirth: String,
    phone: {
      type: String,
      unique: true,
    },
    active: {
      type: Boolean,
      default: true,
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
    leave: Number,
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Employer = mongoose.model('employers', EmployerSchema);
const Attendance = mongoose.model('attendance', EmployerAttendance);

module.exports = {
  Employer,
  Attendance,
};
