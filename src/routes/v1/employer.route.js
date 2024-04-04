const express = require('express');
const router = express.Router();
const EmployerController = require('../../controllers/employer.controller');

router.route('/').post(EmployerController.createEmployer).get(EmployerController.getAllEmployer);
router.route('/:id').put(EmployerController.updateEmployerById).delete(EmployerController.deleteEmployerById);
