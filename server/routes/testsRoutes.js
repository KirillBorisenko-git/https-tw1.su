const { Router } = require('express');
const { getTests } = require('../controllers/testsController');

const router = Router();

router.get('/', getTests);

module.exports = router;
