'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/api');

router.route('/hr').get(controller.hr);
router.route('/company').get(controller.company);


module.exports = router;
