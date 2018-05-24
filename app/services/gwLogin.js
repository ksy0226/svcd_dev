'use strict';

var request = require("request");
var async = require('async');
var logger = require('log4js').getLogger('app');
var CONFIG = require('../../config/config.json');

module.exports = {

    userInfo: (req) => {
        logger.debug("gwLogin : ", req.body.email);
        logger.debug("gwLogin : ", req.body.password);

        async.waterfall([function (callback) {
            request({
                uri: CONFIG.groupware.uri+"/CoviWeb/api/UserInfo.aspx?email=" + req.body.email + "&password=" + req.body.password,
                headers: {
                    'Content-type': 'application/json'
                },
                method: "GET",
                //form: {
                //  id: "ISU_ST01004",
                //  password :"3DE413271C5D3573FC9BF9BF78A9CDFB"
                //}
            }, function (err, res, body) {
                logger.debug("===>");
                callback(null, body);
            });
        }], function (err, body) {
            logger.debug(body);
            logger.debug("xxx : ",JSON.parse(body));
            logger.debug("user : ",this.user);
            this.user = JSON.parse(body);
            logger.debug("user : ",this.user);
            return {a:"bb"};
        });

    },

};