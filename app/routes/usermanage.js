'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/usermanage');
const ssc = require('../util/session');

router.route('/').get(ssc.sessionCheck, controller.index);
router.route('/new').get(ssc.sessionCheck, controller.new)
                    .post(ssc.sessionCheck, controller.save);
router.route('/edit/:id').get(ssc.sessionCheck, controller.edit)
                         .post(ssc.sessionCheck, controller.update);
router.route('/delete/:id').get(ssc.sessionCheck, controller.delete);
router.route('/userInfo').get(ssc.sessionCheck, controller.userInfo);
router.route('/userJSON').get(ssc.sessionCheck, controller.userJSON);
router.route('/list').get(ssc.sessionCheck, controller.list);
router.route('/myPage').get(ssc.sessionCheck, controller.myPage)
                       .post(ssc.sessionCheck, controller.myPageUpdate);

module.exports = router;
