'use strict';

const mongoose = require('mongoose');
const async = require('async');
const CompanyModel = require('../models/Company');
const Usermanage = require('../models/Usermanage');
const service = require('../services/usermanageAccess');
const logger = require('log4js').getLogger('app');
const Iconv = require('iconv-lite');

module.exports = {

    index: (req, res, next) => {

        logger.debug("===============================")
        logger.debug("==============index============");
        logger.debug("===============================")

        async.waterfall([function (callback) {
            Usermanage.find({}, function (err, usermanageAccess) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }
                callback(null, usermanageAccess)
            });
        }, function (usermanageAccess, callback) {
            CompanyModel.find({}, function (err, company) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }
                callback(null, usermanageAccess, company)
            }).sort({
                group_flag: -1,
                company_nm: 1
            })
            ;
        }], function (err, usermanageAccess, company) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                
                //logger.debug("===============================")
                //logger.debug("usermanageAccess : ", usermanageAccess);
                //logger.debug("company : ", company);
                //logger.debug("===============================")

                res.render("usermanageAccess/index", {
                    cache : true,
                    company: company,
                    usermanageAccess: usermanageAccess
                });
            }
        });
    },

    save: (req, res, next) => {
        //logger.debug('Usermanage save debug Start >>> ', req.body.usermanageAccess);
        var usermanageAccess = req.body.usermanageAccess;
        Usermanage.create(req.body.usermanageAccess, function (err, usermanageAccess) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                res.redirect('/');
            }
        });
    },

    edit: (req, res, next) => {
        async.waterfall([function (callback) {
            CompanyModel.find({}, function (err, company) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }
                callback(null, company)
            }).sort({
                group_flag: -1,
                company_nm: 1
            });
        }], function (err, company) {
            Usermanage.findById(req.params.id, function (err, usermanageAccess) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                } else {
                    res.render("usermanageAccess/edit", {
                        cache : true,
                        usermanageAccess: usermanageAccess,
                        user: req.user,
                        company: company
                    });
                }
            });
        });
    },

    update: (req, res, next) => {
        req.body.usermanageAccess.updatedAt = Date.now();
        Usermanage.findOneAndUpdate({
            _id: req.params.id
        }, req.body.usermanageAccess, function (err, usermanageAccess) {
            if (err) return res.json({
                success: false,
                message: err
            });
            if (!usermanageAccess) return res.json({
                success: false,
                message: "No data found to update"
            });
            res.redirect('/usermanageAccess/');
        });
    },

    delete: (req, res, next) => {
        Usermanage.findOneAndRemove({
            _id: req.params.id
        }, function (err, usermanageAccess) {
            if (err) return res.json({
                success: false,
                message: err
            });
            if (!usermanageAccess) return res.json({
                success: false,
                message: "No data found to delete"
            });
            res.redirect('/usermanageAccess');
        });
    },

    //ajax list 데이타 처리
    list: (req, res, next) => {
        var search = service.createSearch(req);

        //logger.debug("=====================> " + JSON.stringify(search));
        //console.log("=====================> " + JSON.stringify(search));

        try {
            async.waterfall([function (callback) {
                Usermanage.find(search.findUsermanage, function (err, usermanageAccess) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        callback(null, usermanageAccess)
                    }
                }).sort('userCompany_nm').sort('employee_nm');
            }], function (err, usermanageAccess) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {
                    res.send(usermanageAccess);
                }
            });
        } catch (e) {
            logger.debug('list controllers error ===> ', e)
        }
    },

    //ajax list 데이타 처리
    allAccess: (req, res, next) => {
        var search = service.createSearch(req);

        //logger.debug("=====================> " + JSON.stringify(search));
        //console.log("=====================> " + JSON.stringify(search));

        try {
            async.waterfall([function (callback) {
                Usermanage.find(search.findUsermanage, function (err, usermanageAccess) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    }
                    callback(null, usermanageAccess);
                });
            }], function (err, usermanageAccess) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {
                    if (usermanageAccess.length > 0) {
                        for (var i = 0; i < usermanageAccess.length; i++) {
                            var newId = usermanageAccess[i]._id;
                            Usermanage.findOneAndUpdate({ _id: newId }, { access_yn: "Y" }, function (err, usermanageAccess) {
                                if (err) {
                                    return res.json({
                                        success: false,
                                        message: err
                                    });
                                }
                            });
                        }
                    }
                    res.send(usermanageAccess);
                }
            });
        } catch (e) {
            logger.debug('allAccess controllers error ===> ', e)
        }
    }
};
