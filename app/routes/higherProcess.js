'use strict';

const express = require('express');
const router = express.Router();
const ssc = require('../util/session');
const controller = require('../controllers/higherProcess');

router.route('/').get(ssc.sessionCheck,controller.index);
router.route('/list').get(ssc.sessionCheck,controller.list);
router.route('/new').get(ssc.sessionCheck,controller.new)
                    .post(ssc.sessionCheck,controller.save);
router.route('/:id/edit').get(ssc.sessionCheck,controller.edit)
                         .post(ssc.sessionCheck,controller.update);
router.route('/:id/save').post(ssc.sessionCheck,controller.update);
router.route('/:id/delete').get(ssc.sessionCheck,controller.delete);

router.route('/getHigherProcess').get(ssc.sessionCheck,controller.getHigherProcess);
//router.route('/exceldownload').get(controller.exceldownload);
router.route('/getHigher').get(ssc.sessionCheck,controller.getHigher);
router.route('/getUFhigherprocess').get(ssc.sessionCheck,controller.getUFhigherprocess);

module.exports = router;
