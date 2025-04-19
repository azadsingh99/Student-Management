const express = require('express');
const router = express.Router();
const { validateStudent } = require('../middleware/validation');
const {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');

// Student routes with validation
router.post('/', validateStudent, createStudent);
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.put('/:id', validateStudent, updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;