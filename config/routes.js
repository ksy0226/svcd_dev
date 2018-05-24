'use strict';

//const CONFIG = require('./config.json');
const router = require('express').Router();
const logger = require('log4js').getLogger(__filename);
const app = require('../app');

module.exports = () => {

    /*------------------- Routes -------------------*/
    router.use('/', require('../app/routes/index'));
    //router.use('/register', require('../app/routes/register'));
    //router.use('/account', require('../app/routes/account'));
    router.use('/incident', require('../app/routes/incident'));
    router.use('/manager', require('../app/routes/manager'));
    router.use('/usermanage', require('../app/routes/usermanage'));
    router.use('/company', require('../app/routes/company'));
    router.use('/search', require('../app/routes/search'));
    router.use('/higherProcess', require('../app/routes/higherProcess'));
    router.use('/lowerProcess', require('../app/routes/lowerProcess'));
    router.use('/oftenqna', require('../app/routes/oftenqna'));
    router.use('/myProcess', require('../app/routes/myProcess'));
    router.use('/processGubun', require('../app/routes/processGubun'));
    router.use('/statistic', require('../app/routes/statistic'));
    router.use('/usermanageAccess', require('../app/routes/usermanageAccess'));
    router.use('/companyProcess', require('../app/routes/companyProcess'));
    router.use('/api', require('../app/routes/api'));


    /// catch 404 and forward to error handler
    router.use(function(req, res, next) {

        res.status(404);
        if (req.xhr) {
            res.send({
                error: 'Resource not found.'
            });
        } else {
            res.render('http/404');
        }
    });

    router.use(function(err, req, res, next) {
        logger.log(err.stack);

        res.status(500);
        var data = {err: {} };

        if (req.app.get('env') === 'development') {
            data.err = err;
            /* 김상엽
            app.use(function(req, res, next)
            {
              if (req.headers['x-forwarded-proto'] != 'https')
                res.redirect(['https://', req.headers.host, req.url].join(''));
              else
                next();
            });
            */
        }

        if (req.xhr) {
            res.send({
                error: 'Something went wrong.',
                details: data
            });
        } else {
            res.render('http/500',data);
        }
    });



    return router;
};
