'use strict';

const express = require('express');
const router = express.Router();
const ssc = require('../util/session');
const logger = require('log4js').getLogger('app');
const upload = require('../util/multer');
const upload2 = require('../util/multer2');

const controller = require('../controllers/oftenQna');

router.route('/').get(ssc.sessionCheck, controller.index);
router.route('/new').get(ssc.sessionCheck, controller.new)
                    .post(upload.array('oftenqna[attach-file]'), ssc.sessionCheck, controller.save);
router.route('/edit/:id').get(ssc.sessionCheck, controller.edit)
                         .post(upload.array('oftenqna[attach-file]'), ssc.sessionCheck, controller.update);
router.route('/delete/:id').get(ssc.sessionCheck, controller.delete);

router.route('/insertedImage').post(upload2.array('insertedImage'), ssc.sessionCheck, controller.insertedImage);
router.route('/download/:path1/:path2/:filename').get(ssc.sessionCheck, controller.download);
router.route('/list').get(ssc.sessionCheck, controller.list);
router.route('/save/:id').get(ssc.sessionCheck, controller.edit)
                         .post(upload.array('oftenqna[attach-file]'), ssc.sessionCheck, controller.update);

module.exports = router;
