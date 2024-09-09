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
    headId: {
      type: String,
    },
    dateOfJoining: String,
    gender: String,
    designation: String,
    department: String,
    head: String,
    aadharNo: {
      type: String,
    },
    panNo: {
      type: String,
    },
    address: String,
    currentAddress: String,
    profEmail: {
      type: String,
    },
    alternatePhone: {
      type: String,
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
    grossSalary: String,
    pf: String,
    esi: String,
    active: {
      type: Boolean,
      default: true,
    },
    head: {
      type: Boolean,
      default: false,
    },
    passwordUpdated: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      trim: true,
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
    toDate: {
      type: String,
    },
    days: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: true,
    },
    Status: {
      type: String,
      default: 'Pending',
    },
    headId: {
      type: String,
    },
    LeaveBy: {
      type: String,
    },
  },
  { timestamps: true }
);

const compOffSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    empId: String,
    leavetype: String,
    alternateDate: {
      type: String,
    },
    weekOffId: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    weekOffDate: String,
    compOff: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const permissionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    empId: String,
    date: String,
    month: String,
    year: String,
    fromTime: String,
    toTime: String,
    duration: String,
  },
  { timestamps: true }
);

const EventSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    title: {
      type: String,
    },
    date: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    archive: {
      type: Boolean,
      default: false,
    },
    holiday: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: String,
    },
  },
  { timestamps: true }
);

const AnnouncementSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    fromDate: {
      type: String,
    },
    toDate: {
      type: String,
    },
    fromTime: {
      type: String,
    },
    toTime: {
      type: String,
    },
    Type: {
      type: String,
    },
  },
  { timestamps: true }
);

const AssetsSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    assetName: {
      type: String,
    },
    qty: {
      type: Number,
    },
    model: {
      type: String,
    },
    serialNumber: {
      type: String,
    },
    purchaseDate: {
      type: String,
    },
    expiryDate: {
      type: String,
    },
    price: {
      type: Number,
    },
    category: {
      type: String,
    },
    vendor: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    archive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const AssetsAssignSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    assetId: {
      type: String,
    },
    empId: {
      type: String,
    },
    assigned: {
      type: Boolean,
      default: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    archive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const BankDetailsSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    employerId: {
      type: String,
    },
    bankName: {
      type: String,
    },
    account: {
      type: String,
    },
    ifsc: {
      type: String,
    },
    accountType: {
      type: String,
    },
    branchName: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    archive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Employer = mongoose.model('employers', EmployerSchema);
const Attendance = mongoose.model('attendance', EmployerAttendance);
const CompOff = mongoose.model('compoff', compOffSchema);
const Permission = mongoose.model('permission', permissionSchema);
const Event = mongoose.model('events', EventSchema);
const Announcement = mongoose.model('announcement', AnnouncementSchema);
const Assets = mongoose.model('assets', AssetsSchema);
const AssetsAssigned = mongoose.model('assetsassigned', AssetsAssignSchema);
const BankDetail = mongoose.model('bankdetails', BankDetailsSchema);

module.exports = {
  Employer,
  Attendance,
  CompOff,
  Permission,
  Event,
  Announcement,
  Assets,
  AssetsAssigned,
  BankDetail,
};
