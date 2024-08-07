const express = require('express');
const router = express.Router();
const WhyTapController = require('../../controllers/whytap.controller');

router.route('/').post(WhyTapController.createWhyTapAdmin);
router.route('/login').post(WhyTapController.LoginByEmailPassword);
router.route('/students').post(WhyTapController.createStudent).get(WhyTapController.getStudent);
router.route('/students/:id').put(WhyTapController.updateStudentbyId);
router.route('/placement').post(WhyTapController.createPlacements).get(WhyTapController.getplacement);
router.route('/placement/:id').put(WhyTapController.updateplacementbyId).get(WhyTapController.getPlaceMentsById);
router.route('/placement/student/status/:id').put(WhyTapController.updateCandStatusInPlaceMent);
router.route('/placements/students/:id').get(WhyTapController.getPlaceMentsByStudents);
router.route('/batches').post(WhyTapController.createBatch);
router.route('/batches').get(WhyTapController.getbatch);
router.route('/batch/:id').put(WhyTapController.updateBatch).get(WhyTapController.getbatch);

router.route('/course').post(WhyTapController.createCourse);
router.route('/course').get(WhyTapController.getCourse);
router.route('/course/:id').put(WhyTapController.updateCourse).get(WhyTapController.getCourse);

router.route('/company').post(WhyTapController.createCompany);
router.route('/company').get(WhyTapController.getCompany);
router.route('/company/:id').put(WhyTapController.updateCompany).get(WhyTapController.getCompany);
router.route('/delete/:id/:menu').delete(WhyTapController.deleteById_withMenu)
router.route('/dashboardCounts').get(WhyTapController.getDashboardCounts)
router.route('/getbatchstudents').get(WhyTapController.getBatchStudents)
router.route('/getStudentBatchWiseChart/:batchId').get(WhyTapController.getStudentBatchWiseChart);
router.route('/getPlacedCandidatesList').get(WhyTapController.getPlacedStudents);
router.route('/getUnPlacedCandidatesList').get(WhyTapController.getUnPlacedStudents);
router.route('/deleteSelectedData').delete(WhyTapController.deleteSelectedData);

module.exports = router;
