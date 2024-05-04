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
    grossSalary:String,
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
  alternateDate:{
    type:String,
  },
  weekOffId:{
    type:String,
  },
  active:{
    type:Boolean,
    default:true
  },
  weekOffDate:String,
  compOff:{
   type: Number,
   default:0
  },
},
{ timestamps: true })

const permissionSchema = new mongoose.Schema({
  _id:{
    type: String,
    default:v4,
  },
  empId:String,
  date:String,
  month:String,
  year:String,
  fromTime:String,
  toTime:String,
  duration:String,
},{timestamps: true})


const Employer = mongoose.model('employers', EmployerSchema);
const Attendance = mongoose.model('attendance', EmployerAttendance);
const CompOff = mongoose.model('compoff',compOffSchema)
const Permission = mongoose.model('permission',permissionSchema);

module.exports = {
  Employer,
  Attendance,
  CompOff,
  Permission
};
