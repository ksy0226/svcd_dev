'use strict';
const CompanyModel = require('../models/Company');
const logger = require('log4js').getLogger('app');

module.exports = {

    sessionCheck: (req, res, next) => {
        
        var minute = 60 * 1000;

        logger.debug('=====================session=================');
        logger.debug('req.session.email : ' + req.session.email);
        logger.debug('req.session.user_flag : ' + req.session.user_flag);
        logger.debug('req.session.group_flag : ' + req.session.group_flag);
        logger.debug('req.session.dept_cd : ' + req.session.dept_cd);
        logger.debug('=============================================\n');

        if (req.session.email != null || req.session.email != undefined) {
            next();

        } else { //세션값이 없으면

            logger.debug('=====================session=================');
            logger.debug('req.cookies.email : ' + req.cookies.email);
            logger.debug('req.cookies.remember_me : ' + req.cookies.remember_me);
            logger.debug('req.cookies.user_flag : ' + req.cookies.user_flag);
            logger.debug('req.cookies.group_flag : ' + req.cookies.group_flag);
            logger.debug('=============================================\n');

            if (req.cookies.user_flag != null || req.session.user_flag != undefined) {
                
                req.session.email = req.cookies.email;
                req.session.user_flag = req.cookies.user_flag;
                req.session.group_flag = req.cookies.group_flag;

                req.session.user_id = req.cookies.user_id;
                req.session.sabun = req.cookies.sabun;
                req.session.password = req.cookies.password;
                req.session.user_nm = req.cookies.employee_nm;
                req.session.company_cd = req.cookies.company_cd;
                req.session.company_nm = req.cookies.company_nm;
                req.session.dept_cd = req.cookies.dept_cd;
                req.session.dept_nm = req.cookies.dept_nm;
                req.session.position_nm = req.cookies.position_nm;
                req.session.jikchk_nm = req.cookies.jikchk_nm;
                req.session.office_tel_no = req.cookies.office_tel_no;
                req.session.hp_telno = req.cookies.hp_telno;

                next();

            } else {
                var email = req.cookies.email;
                var remember_me = req.cookies.remember_me;

                res.render('index', {
                    cache : true,
                    email: email,
                    remember_me: remember_me
                });

            }
        }
    }
}