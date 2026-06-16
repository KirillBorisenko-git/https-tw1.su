const { Router } = require('express');
const { auth, adminOnly } = require('../middleware/auth');
const { getStats, getTestStats, getQuestions, addQuestion, deleteQuestion } = require('../controllers/adminController');
const { getTestsAdmin, createTest, updateTest, deleteTest } = require('../controllers/testsController');
const { getEmployees, assignTest, removeAssignment } = require('../controllers/employeesController');
const { upload } = require('../db');

const router = Router();

router.use(auth, adminOnly);

router.get('/stats', getStats);
router.get('/test-stats', getTestStats);

router.get('/questions', getQuestions);
router.post('/questions', upload.single('attachment'), addQuestion);
router.delete('/questions/:id', deleteQuestion);

router.get('/tests', getTestsAdmin);
router.post('/tests', createTest);
router.put('/tests/:id', updateTest);
router.delete('/tests/:id', deleteTest);

router.get('/employees', getEmployees);
router.post('/assign', assignTest);
router.delete('/assign/:id', removeAssignment);

module.exports = router;
