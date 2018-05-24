'use strict';

const express = require('express');
const router = express.Router();
const ssc = require('../util/session');
const controller = require('../controllers/search');

router.route('/user_list').get(ssc.sessionCheck, controller.user_list);
router.route('/user_detail/:id').get(ssc.sessionCheck, controller.user_detail);
router.route('/user_qna').get(ssc.sessionCheck, controller.user_qna);
router.route('/mng_list').get(ssc.sessionCheck, controller.mng_list);
//router.route('/mng_detail/:id').get(ssc.sessionCheck, controller.mng_detail);
router.route('/remain_list').get(ssc.sessionCheck, controller.remain_list);
router.route('/status_list').get(ssc.sessionCheck, controller.status_list);
router.route('/getlowerprocess').get(ssc.sessionCheck, controller.getlowerprocess);
router.route('/list').get(ssc.sessionCheck, controller.list);
router.route('/getqnalist').get(controller.getqnalist);
router.route('/qna_detail/:id').get(ssc.sessionCheck, controller.qna_detail);
router.route('/download/:path1/:path2/:filename').get(ssc.sessionCheck, controller.download);
router.route('/getRemainList').get(ssc.sessionCheck, controller.getRemainList);



module.exports = router;
