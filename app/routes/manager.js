'use strict';

const express = require('express');
const router = express.Router();
const ssc = require('../util/session');
const controller = require('../controllers/manager');

router.route('/work_list').get(ssc.sessionCheck, controller.work_list);
router.route('/work_detail/:id').get(ssc.sessionCheck, controller.work_detail);
router.route('/saveReceipt/:id').post(ssc.sessionCheck, controller.saveReceipt);
router.route('/saveHChange/:id').post(ssc.sessionCheck, controller.saveHChange);
router.route('/saveComplete/:id').post(ssc.sessionCheck, controller.saveComplete);
router.route('/work_assign').get(ssc.sessionCheck, controller.work_assign);
router.route('/month_list').get(ssc.sessionCheck, controller.month_list);
router.route('/com_process').get(ssc.sessionCheck, controller.com_process);
router.route('/getIncidentDetail/:id').get(ssc.sessionCheck, controller.getIncidentDetail);
router.route('/getManager').get(ssc.sessionCheck, controller.getManager);
router.route('/saveHold/:id').post(ssc.sessionCheck, controller.saveHold);
router.route('/saveNComplete/:id').post(ssc.sessionCheck, controller.saveNComplete);



module.exports = router;
