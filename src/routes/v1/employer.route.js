const express = require('express');
const router = express.Router();
const EmployerController = require('../../controllers/employer.controller');
const multer = require('multer');
const { VerifyAuth } = require('../../middlewares/employerAuth');

const storage = multer.memoryStorage({
  destination: function (req, res, callback) {
    callback(null, '');
  },
});

const EmployerUpload = multer({ storage }).single('employer');

router.route('/').post(EmployerController.createEmployer);
router.route('/get/all').get(EmployerController.getAllEmployer);
router.route('/:id').put(EmployerController.updateEmployerById).delete(EmployerController.deleteEmployerById);

router.route('/get/atten/id/:id').post(EmployerController.getEmployerById);
router.route('/single/:id').get(EmployerController.getEmployeeById);
router.route('/get/atten').get(EmployerController.getAllEmployerAtten);

// manage Attendance Endpoints

router.route('/attendanceAll').post(EmployerController.Addattendance_EveryDay);
router.route('/attendance/:id').put(EmployerController.updateAttendance);
router.route('/get/attendance').get(EmployerController.getAttendance);
router.route('/gettoday/report/counts').get(EmployerController.gettodayReportCounts);

//ruban
router.route('/get/weekOff').get(EmployerController.getWeekoffById);
router.route('/compoff').post(EmployerController.createCompOff);
router.route('/compoff/:id').put(EmployerController.deductCompOff);
router.route('/getCompOff/:id').get(EmployerController.getCompOffById);
router.route('/get/status').post(EmployerController.getEmployeeStatusById);
router.route('/create/permission').post(EmployerController.createPermission);
router.route('/get/permissionStatus').post(EmployerController.getPermissionStatus);
router.route('/get/permission').post(EmployerController.getPermission);
router.route('/delete/permission/:id').delete(EmployerController.deletePermission);
router.route('/update/permission/:id').put(EmployerController.updatePermission);
router.route('/bulk/upload/').post(EmployerUpload, EmployerController.EmployerBulkUpload);

// Event End Points

router.route('/event').post(EmployerController.createEventsByHr).get(VerifyAuth, EmployerController.getEvents);
router.route('/all/events/hr').get(EmployerController.getEventsForHr);
// Announcement

router.route('/announcement').post(EmployerController.createAnnouncement).get(EmployerController.getAnnouncement);
router.route('/announcement/staff').get(EmployerController.getAnnouncementStaff);

// assets

router.route('/create/new/assets').post(EmployerController.createNewAssets);
router.route('/get/assets/bycategory').get(EmployerController.getAssetsBycategory);
router.route('/assign/assets').post(EmployerController.assignAssets);
router.route('/un/assigned/:id').delete(EmployerController.UnAssigned);
router.route('/update/assets/byid/:id').put(EmployerController.updateAssetsById);
router.route('/get/assets/counds/bycategory').get(EmployerController.getAssetsCoundsByCategory);
module.exports = router;
