const mongoose = require('mongoose');
const { v4 } = require('uuid');

const whyTapUserSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    phone: String,
  },
  {
    timestamps: true,
  }
);

const StudentsSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
    },
    batch: String,
    dob: String,
    linkedinUrl: String,
    githubUrl: String,
    course: String,
    address: String,
    parentContact: String,
    status: {
      type: String,
      default: 'Pending',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const studentStatusSchema = new mongoose.Schema(
  {
    id: String,
    status: {
      type: String,
      default: 'Pending',
    },
  },
  { timestamps: true }
);

const PlacementSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    companyName: {
      type: String,
    },
    jobTitle: {
      type: String,
    },
    location: {
      type: String,
    },
    companyAddress: String,
    students: [studentStatusSchema],
    interviewDate: String,
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model('whytapadmin', whyTapUserSchema);
const Students = mongoose.model('students', StudentsSchema);
const Placement = mongoose.model('placement', PlacementSchema);

module.exports = { Admin, Students, Placement };