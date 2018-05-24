'use strict';

const express = require('express');
const router = express.Router();
const ssc = require('../util/session');
const controller = require('../controllers/processGubun');

router.route('/').get(ssc.sessionCheck, controller.index);
router.route('/new').get(ssc.sessionCheck, controller.new)
                    .post(ssc.sessionCheck, controller.save);
router.route('/edit/:id').get(ssc.sessionCheck, controller.edit)
                         .post(ssc.sessionCheck, controller.update);
router.route('/delete/:id').get(ssc.sessionCheck, controller.delete);
router.route('/getJSON/:higher_cd').get(ssc.sessionCheck, controller.getJSON);
router.route('/list').get(ssc.sessionCheck, controller.list);
router.route('/getProcessStatus').get(ssc.sessionCheck, controller.getProcessStatus);

module.exports = router;
