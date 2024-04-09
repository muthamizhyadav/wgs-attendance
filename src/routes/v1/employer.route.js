const express = require('express');
const router = express.Router();
const EmployerController = require('../../controllers/employer.controller');

router.route('/').post(EmployerController.createEmployer).get(EmployerController.getAllEmployer);
router
  .route('/:id')
  .put(EmployerController.updateEmployerById)
  .delete(EmployerController.deleteEmployerById)
  .get(EmployerController.getEmployerById);

router.route('/single/:id').get(EmployerController.getEmployeeById);

// manage Attendance Endpoints

router.route('/attendance').post(EmployerController.Addattendance_EveryDay);
router.route('/attendance/:id').put(EmployerController.updateAttendance);
router.route('/get/attendance').get(EmployerController.getAttendance);
router.route('/gettoday/report/counts').get(EmployerController.gettodayReportCounts);

module.exports = router;
