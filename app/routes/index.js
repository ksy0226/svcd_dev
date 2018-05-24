var express = require('express');
var router = express.Router();
var log = require('log4js').getLogger("index");
var ssc = require('../util/session');
//require('../util/cookie');

const controller = require('../controllers/login');

/* GET home page. */
router.get('/', ssc.sessionCheck, controller.index);

router.route('/index').post(controller.logincheck)
                      .get(ssc.sessionCheck, controller.retry);
router.route('/new').post(controller.new);
router.route('/index1').get(ssc.sessionCheck, controller.index1);  
router.route('/index2').get(ssc.sessionCheck, controller.index2);
router.route('/logout').get(ssc.sessionCheck, controller.logout);
router.route('/login/main_list').get(ssc.sessionCheck, controller.main_list);
router.route('/login/main_list_nocomplete').get(ssc.sessionCheck, controller.main_list_nocomplete);

/**
 * 그룹시스템 인터페이스 용
 */
router.route('/login').get(controller.login);

/**
 * stlc 로그인 용
 */
router.route('/loginstlc').get(controller.loginstlc);

module.exports = router;
