const express = require('express');
const router = express.Router();
const EmployerController = require('../../controllers/employer.controller');

router.route('/').post(EmployerController.createEmployer)
router.route('/get/all').get(EmployerController.getAllEmployer);
router
  .route('/:id')
  .put(EmployerController.updateEmployerById)
  .delete(EmployerController.deleteEmployerById)
  
router.route('/get/atten/id/:id').post(EmployerController.getEmployerById)
router.route('/single/:id').get(EmployerController.getEmployeeById);
router.route('/get/atten').get(EmployerController.getAllEmployerAtten) 

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
router.route('/get/permissionStatus').post(EmployerController.getPermissionStatus)
router.route('/get/permission').post(EmployerController.getPermission)
router.route('/delete/permission/:id').delete(EmployerController.deletePermission)
router.route('/update/permission/:id').put(EmployerController.updatePermission)


module.exports = router; 
