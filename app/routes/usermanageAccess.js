'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/usermanageAccess');
const ssc = require('../util/session');

router.route('/').get(ssc.sessionCheck, controller.index);
router.route('/edit/:id').get(ssc.sessionCheck, controller.edit)
                         .post(ssc.sessionCheck, controller.update);
router.route('/delete/:id').get(ssc.sessionCheck, controller.delete);
router.route('/list').get(ssc.sessionCheck, controller.list);
router.route('/allAccess').get(ssc.sessionCheck, controller.allAccess);

module.exports = router;
