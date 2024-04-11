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

module.exports = router;
