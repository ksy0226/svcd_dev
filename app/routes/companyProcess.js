'use strict';

const express = require('express');
const router = express.Router();
const ssc = require('../util/session');
const controller = require('../controllers/companyProcess');

router.route('/').get(ssc.sessionCheck, controller.edit);
router.route('/edit').get(ssc.sessionCheck, controller.edit)
                     .post(ssc.sessionCheck, controller.update);
                     
router.route('/getCompanyProcess').get(ssc.sessionCheck,controller.getCompanyProcess);

module.exports = router;
