const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { getMyAssignments, markSeen, markDone } = require('../controllers/employeesController');

const router = Router();

router.use(auth);
router.get('/', getMyAssignments);
router.post('/:id/seen', markSeen);
router.post('/:id/done', markDone);

module.exports = router;
