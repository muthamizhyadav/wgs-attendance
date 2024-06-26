const { required, boolean } = require('joi');
const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { trim } = require('validator');

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
    role: String,
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
    batchId: String,
    dob: String,
    gender: String,
    parentname: String,
    linkedinUrl: String,
    githubUrl: String,
    courseId: String,
    address: String,
    city: String,
    state: String,
    country: String,
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
  { _id: false }
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
    companyId: {
      type: String,
    },
    jobTitle: {
      type: String,
    },
    location: {
      type: String,
    },
    jobdescription: String,
    companyAddress: String,
    students: {
      type: Array,
      default: [],
    },
    interviewDate: String,
  },
  {
    timestamps: true,
  }
);

const PlacementDetailsSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    placementId: {
      type: String,
    },
    studentId: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const BatchSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  batchname: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  startDate: {
    type: String,
    trim: true
  },
  endDate: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const CourseSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  coursename: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

const CompanySchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  companyname: {
    type: String,
    required: true,
    trim: true,
  },
  // location: {
  //   type: String,
  //   required: true,
  //   trim: true,
  // },
  addressline1: {
    type: String,
    required: true,
    trim: true,
  },
  addressline2: {
    type: String,
    trim: true,
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  contactPersonNumber: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  companysize: {
    type: String,
    trim: true
  },
  currentlyRecruting: {
    type: Boolean,
    Default: false
  },

}, { timestamps: true });

const Admin = mongoose.model('whytapadmin', whyTapUserSchema);
const Students = mongoose.model('students', StudentsSchema);
const Placement = mongoose.model('placement', PlacementSchema);
const PlacementDetails = mongoose.model('placementdetails', PlacementDetailsSchema);
const Batch = mongoose.model('batch', BatchSchema);
const Course = mongoose.model('course', CourseSchema);
const Company = mongoose.model('company', CompanySchema);

module.exports = { Admin, Students, Placement, PlacementDetails, Batch, Course, Company };
