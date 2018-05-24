'use strict';

const mongoose = require('mongoose');
const async = require('async');
const LowerProcessModel = require('../models/LowerProcess');
const HigherProcessModel = require('../models/HigherProcess');
const CompanyModel = require('../models/Company');
const service = require('../services/lowerProcess');
const logger = require('log4js').getLogger('app');
const Iconv = require('iconv-lite');

module.exports = {

    index: (req, res, next) => {
        LowerProcessModel.find(req.body.lowerProcess, function (err, lowerProcess) {
            //logger.debug('index 호출');
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                //if(lowerProcess.created_at != '') lowerProcess.created_at = lowerProcess.created_at.substring(0,10);
                //if(lowerProcess.register_date != '') lowerProcess.register_date = lowerProcess.register_date.substring(0,10);

                res.render("lowerProcess/index", {
                    cache : true,
                    lowerProcess: lowerProcess
                });
            }
        });
    },

    new: (req, res, next) => {
        async.waterfall([function (callback) {
            HigherProcessModel.find({}, function (err, higher) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }
                callback(null, higher)
            });
        }, function (higher, callback) {
            CompanyModel.find({}, function (err, company) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }
                callback(null, higher, company)
            });
        }], function (err, higher, company) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                res.render("lowerProcess/new", {
                    cache : true,
                    higher: higher,
                    company: company
                });
            }
        });
    },

    save: (req, res, next) => {
        var lowerProcess = req.body.lowerProcess;
        lowerProcess.sabun = req.session.email;
        lowerProcess.user_nm = req.session.user_nm;
        lowerProcess.company_nm = req.session.company_nm;

        LowerProcessModel.create(lowerProcess, function (err, lowerProcess) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                res.redirect('/lowerProcess');
            }
        });
    },

    edit: (req, res, next) => {
        LowerProcessModel.findById(req.params.id, function (err, lowerProcess) {
            if (err) return res.json({
                success: false,
                message: err
            });
            res.render("lowerProcess/edit", {
                cache : true,
                lowerProcess: lowerProcess
            });
        });
    },

    update: (req, res, next) => {
        LowerProcessModel.findOneAndUpdate({
            _id: req.params.id
        }, req.body.lowerProcess, function (err, lowerProcess) {
            if (err) return res.json({
                success: false,
                message: err
            });
            if (!lowerProcess) return res.json({
                success: false,
                message: "No data found to update"
            });
            //res.redirect('/lowerProcess/edit/' + req.params.id);
            res.redirect('/lowerProcess/');
        });
    },

    delete: (req, res, next) => {
        LowerProcessModel.findOneAndRemove({
            _id: req.params.id
        }, function (err, lowerProcess) {
            if (err) return res.json({
                success: false,
                message: err
            });
            if (!lowerProcess) return res.json({
                success: false,
                message: "No data found to delete"
            });
            res.redirect('/lowerProcess');
        });
    },

    /**
    * 처리구분 JSON 조회
    */
    getJSON: (req, res, next) => {
        try {
            async.waterfall([function (callback) {
                //상위코드용 업무처리 개수 조회
                LowerProcessModel.count({ "higher_cd": req.params.higher_cd }, function (err, count) {
                    if (err) return res.json({
                        success: false,
                        message: err
                    });
                    callback(null, count)
                });
            }], function (err, count) {
                //var higher_cd = req.params.higher_cd;
                //if (count == 0) higher_cd = '000'; //상위코드용 업무처리가 없으면 공통으로 조회
                var condition ={};
                condition.higher_cd = req.params.higher_cd;
                condition.use_yn = "사용";

                //LowerProcessModel.find({ "higher_cd": higher_cd }, function (err, lowerprocess) {
                LowerProcessModel.find(condition, function (err, lowerprocess) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        res.json(lowerprocess);
                    }
                }).sort('lower_nm');;
            });
        } catch (e) {
            logger.error("manager control saveReceipt : ", e);
            return res.json({
                success: false,
                message: err
            });
        }
    },

    /**
     * 하위업무 조회
     */
    getLowerProcess: (req, res, next) => {
        try {
            var condition = {};
            condition.use_yn = "사용";

            if (req.query.higher_cd != null && req.query.higher_cd != "*") {
                condition.higher_cd = req.query.higher_cd;
            }

            logger.debug("==========================================getLowerProcess=======================================");
            logger.debug("condition : ", condition);
            logger.debug("================================================================================================");

            LowerProcessModel.find(condition, function (err, lowerProcess) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {
                    logger.debug("==========================================getLowerProcess=======================================");
                    logger.debug("lowerProcess : ", JSON.stringify(lowerProcess));
                    logger.debug("==================================================+++===========================================");

                    res.json(lowerProcess);
                }
            }).sort('higher_cd').sort('lower_cd');
        } catch (e) {
            logger.debug(e);
        }
    },

    list: (req, res, next) => {
        var search = service.createSearch(req);

        async.waterfall([function (callback) {
            LowerProcessModel.find(search.findLowerProcess, function (err, lowerProcess) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {
                    /*
                    logger.debug("==========================================getLowerProcess=======================================");
                    logger.debug("lowerProcess : ", lowerProcess);
                    logger.debug("================================================================================================");
                    */

                    callback(null, lowerProcess);
                }
            }).sort('higher_cd').sort('lower_cd');
        }], function (err, lowerProcess) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            } else {
                /*
                logger.debug("==========================================getLowerProcess=======================================");
                logger.debug("lowerProcess list : ", JSON.stringify(lowerProcess));
                logger.debug("==================================================+++===========================================");
                */
                
                res.send(lowerProcess);
            }
        });
    }
};
