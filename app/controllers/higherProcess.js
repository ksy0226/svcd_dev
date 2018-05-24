'use strict';

const mongoose = require('mongoose');
const async = require('async');
const HigherProcessModel = require('../models/HigherProcess');
const MyProcess = require('../models/MyProcess');
const CompanyProcessModel = require('../models/CompanyProcess');
const service = require('../services/higherProcess');
const logger = require('log4js').getLogger('app');

module.exports = {

    index: (req, res, next) => {
        HigherProcessModel.find(req.body.higherProcess, function (err, higherProcess) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                res.render("higherProcess/index", {
                    cache : true,
                    higherProcess: higherProcess
                });
            }
        });
    },

    new: (req, res, next) => {
        res.render("higherProcess/new",{cache : true});
    },

    save: (req, res, next) => {

        var higherProcess = req.body.higherProcess;

        higherProcess.sabun = req.session.email;
        higherProcess.user_nm = req.session.user_nm;
        higherProcess.company_cd = req.session.company_cd;
        higherProcess.company_nm = req.session.company_nm;

        /*
        logger.debug('>>>>>>>>>>>>>>>>>>>> higherProcess save >>>>>>>>>>>>>>>>>>>> ');
        logger.debug('higherProcess >>> ', higherProcess);
        logger.debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ');
        */

        HigherProcessModel.create(higherProcess, function (err, higherProcess) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                res.redirect('/higherProcess/');
            }
        });

    },


    edit: (req, res, next) => {
        HigherProcessModel.findById(req.params.id, function (err, higherProcess) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            } else {
                res.render("higherProcess/edit", {
                    cache : true,
                    higherProcess: higherProcess
                });
            }
        });
    },

    update: (req, res, next) => {
        HigherProcessModel.findOneAndUpdate({
            _id: req.params.id
        }, req.body.higherProcess, function (err, higherProcess) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            } else {
                //if (!higherProcess) return res.json({
                //    success: false,
                //    message: "No data found to update"
                //});
                res.redirect('/higherProcess/');
            }
        });
    },

    delete: (req, res, next) => {
        HigherProcessModel.findOneAndRemove({
            _id: req.params.id
        }, function (err, higherProcess) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            } else {
                //if (!higherProcess) return res.json({
                //    success: false,
                //    message: "No data found to delete"
                //});
                res.redirect('/higherProcess/');
            }
        });
    },

    list: (req, res, next) => {
        var search = service.createSearch(req);

        async.waterfall([function (callback) {
            HigherProcessModel.find(search.findHigherProcess, function (err, higherProcess) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {
                    /*
                    logger.debug("==========================================gethigherProcess=======================================");
                    logger.debug("higherProcess : ", higherProcess);
                    logger.debug("================================================================================================");
                    */

                    callback(null, higherProcess);
                }
            }).sort('higher_cd');
        }], function (err, higherProcess) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            } else {
                /*
                logger.debug("==========================================gethigherProcess=======================================");
                logger.debug("higherProcess list : ", JSON.stringify(higherProcess));
                logger.debug("==================================================+++===========================================");
                */

                res.send(higherProcess);
            }
        });
    },

    /**
     * 상위업무조회
     */
    getHigherProcess: (req, res, next) => {
        try {
            var condition = {};
            condition.use_yn = "사용";

            if (req.query.company_cd != null) {
                condition.company_cd = req.query.company_cd;
            }
            
            logger.debug("=============================================");
            logger.debug("getHigherProcess condition : ", condition);
            logger.debug("=============================================");

            HigherProcessModel.find(condition, function (err, higherProcess) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {
                    res.json(higherProcess);
                }
            }).sort('higher_nm');
        } catch (e) {
            logger.debug(e);
        }
    },


    /**
     * 회사별 상위업무 조회 페이지 - 상위업무조회
     */

    getHigher: (req, res, next) => {
        try {

            logger.debug("==========================================higherProcess getHigher============================");
            logger.debug("====================================================================================================");

            HigherProcessModel.find({}, function (err, higherJsonData) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {

                    //logger.debug("==========================================CompanyModel.find({}========================================");
                    //logger.debug("companyJsonData : ",companyJsonData);
                    //logger.debug("====================================================================================================");

                    res.json(higherJsonData);
                };

            }).sort('higher_cd');
        } catch (e) {
            logger.error("HigherProcessModel error : ", e);
        } finally { }
    },
    /**
  * 상위업무 리스트 조회
  */
    getUFhigherprocess: (req, res, next) => {
        logger.debug("=============================================");
        logger.debug("getUFhigherprocess : ");
        logger.debug("=============================================");

        try {

            if (req.session.user_flag == "3" || req.session.user_flag == "4") {

                var cdt = {};
                cdt.email = req.session.email; //업무담당자는 본인 업무만 조회

                /** MyProcess, HigherProcessModel 모델구분 */
                MyProcess.find(cdt).distinct('higher_cd').exec(function (err, myHigherProcess) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {

                        //logger.debug("=============================================");
                        //logger.debug("search.mng_list higherprocess ", JSON.stringify(myHigherProcess));
                        //logger.debug("=============================================");

                        var condition = {};
                        condition.higher_cd = {
                            "$in": myHigherProcess
                        }

                        HigherProcessModel.find(condition, function (err, higherprocess) {
                            if (err) {
                                return res.json({
                                    success: false,
                                    message: err
                                });
                            } else {
                                res.json(higherprocess);
                            }
                        });
                    }
                });

            } else if (req.session.user_flag == "5") {

                var condition = {};
                condition.company_cd = req.session.company_cd; //고객사관리자는 해당회사만 조회

                /** MyProcess, HigherProcessModel 모델구분 */
                CompanyProcessModel.find(condition, function (err, higherprocess) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        res.json(higherprocess);
                    }
                });

            } else { //일반사용자에게는 권한이 없고 그룹관리자
                logger.debug("=============================================");
                logger.debug("getUFhigherprocess : ");
                logger.debug("=============================================");


                /** MyProcess, HigherProcessModel 모델구분 */
                HigherProcessModel.find({}, function (err, higherprocess) {
                    logger.debug("=============================================");
                    logger.debug("UFhigherprocess  higherprocess : "+ higherprocess);
                    logger.debug("=============================================");

                    if (err) {
                        logger.debug("=============================================");
                        logger.debug("UFhigherprocess  higherprocess err : "+ err);
                        logger.debug("=============================================");

                        return res.json({
                            success: false,
                            message: err
                        });

                    } else {
                        logger.debug("=============================================");
                        logger.debug("UFhigherprocess  higherprocess : "+ higherprocess);
                        logger.debug("=============================================");

                        res.json(higherprocess);
                    }
                });

            }
        } catch (e) {

            logger.error("=============================================");
            logger.error("search.mng_list err : ", e);
            logger.error("=============================================");

        } finally { }

    },

};