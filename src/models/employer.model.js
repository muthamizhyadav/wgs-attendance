const { number, required, string } = require('joi');
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
    aadharNo: {
      type: String,
      unique: true,
    },
    panNo: {
      type: String,
      unique: true,
    },
    address: String,
    currentAddress: String,
    profEmail: {
      type: String,
      unique: true,
    },
    alternatePhone: {
      type: String,
      unique: true,
    },
    alternateName: String,
    alternateRelation: String,
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

const compOffSchema = new mongoose.Schema({
  _id:{
    type: String,
    default:v4,
  },
  empId:String,
  leavetype:String,
  weekOffId:{
    type:String,
  },
  weekOffDate:String,
  compOff:{
   type: Number,
   default:0
  },
},
{ timestamps: true })

const Employer = mongoose.model('employers', EmployerSchema);
const Attendance = mongoose.model('attendance', EmployerAttendance);
const CompOff = mongoose.model('compoff',compOffSchema)

module.exports = {
  Employer,
  Attendance,
  CompOff,
};
