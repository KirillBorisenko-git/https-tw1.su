const { Router } = require('express');
const { auth } = require('../middleware/auth');
const { saveResult } = require('../controllers/resultsController');

const router = Router();

router.post('/', auth, saveResult);

module.exports = router;
