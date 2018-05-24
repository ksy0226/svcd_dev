'use strict';

const express = require('express');
const router = express.Router();
const ssc = require('../util/session');
const logger = require('log4js').getLogger('app');
const upload = require('../util/multer');
const upload2 = require('../util/multer2');

const controller = require('../controllers/incident');

router.route('/').get(ssc.sessionCheck, controller.index);
router.route('/userlist').get(ssc.sessionCheck, controller.userlist);
router.route('/new/:title').get(ssc.sessionCheck, controller.new);
router.route('/new_mng').get(ssc.sessionCheck, controller.new_mng);
router.route('/new').post(upload.array('incident[attach-file]'), ssc.sessionCheck, controller.save);
router.route('/new_mng').post(upload.array('incident[attach-file]'), ssc.sessionCheck, controller.mng_save);
//router.route('/insertedImage').post(upload2.array('insertedImage'), ssc.sessionCheck, controller.insertedImage);
router.route('/viewDetail/:id').get(ssc.sessionCheck, controller.viewDetail);
router.route('/getIncident').get(ssc.sessionCheck, controller.getIncident);
router.route('/getIncidentDetail/:id').get(ssc.sessionCheck, controller.getIncidentDetail);
router.route('/download/:path1/:path2/:filename').get(ssc.sessionCheck, controller.download);
router.route('/valuationSave/:id').post(ssc.sessionCheck,controller.valuationSave);
router.route('/exceldownload').get(ssc.sessionCheck, controller.exceldownload);
router.route('/insertedImage').get(ssc.sessionCheck, controller.insertedImage);
router.route('/deleteIncident/:id').post(ssc.sessionCheck, controller.deleteIncident);
router.route('/reRegister/:id').get(ssc.sessionCheck, controller.reRegister);
router.route('/edit/:id').get(ssc.sessionCheck, controller.edit);


module.exports = router;
