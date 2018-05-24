'use strict';

const mongoose = require('mongoose');
const async = require('async');
const HigherProcessModel = require('../models/HigherProcess');
const ProcessGubunModel = require('../models/ProcessGubun');
const ProcessStatusModel = require('../models/ProcessStatus');
const logger = require('log4js').getLogger('app');
const service = require('../services/processgubun');

module.exports = {

    /**
     * 초기 페이지 출력
     */
    index: (req, res, next) => {
        async.waterfall([function (callback) {
            ProcessGubunModel.find({},function (err, processGubun) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }
                callback(null, processGubun)
            });
        }], function (err, processGubun) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            }else{
                res.render("processGubun/", {
                    cache : true,
                    processGubun: processGubun
                });
            }
        });

    },

    /**
     * 신규 등록 페이지 출력
     */
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
        }], function (err, higher) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                res.render("processGubun/new", {
                    cache : true,
                    higher: higher,
                    user_id: req.session.user_id,
                    user_nm: req.session.user_nm
                });
            }
        });
    },

    /**
     * 저장 처리
     */
    save: (req, res, next) => {
        //console.log('processGubun controller save start!! ');
        var processGubun = req.body.processGubun;
        ProcessGubunModel.create(req.body.processGubun, function (err, processGubun) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                res.redirect('/processGubun/');
            }
        });
    },

    /**
     * 수정화면 출력
     */
    edit: (req, res, next) => {
        try {
            
            
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
            
            }], function (err, higher) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                } else {
                    
                    ProcessGubunModel.findById(req.params.id, function (err, processGubun) {
                        if (err) return res.json({
                            success: false,
                            message: err
                        });
                        //if (!req.user._id.equals(question.author)) return res.json({
                        //    success: false,
                        //    message: "Unauthrized Attempt"
                        //});

                        //logger.debug("================================");
                        //logger.debug("processGubun : ", JSON.stringify(processGubun));
                        //logger.debug("================================");

                        res.render("processGubun/edit", {
                            cache : true,
                            higher : higher,
                            processGubun: processGubun
                            //,user: req.user
                        });
                    });


                }
            });
            
            
            
            



        } catch (e) {
            logger.error(e);
            res.render("http/500", {
                cache : true,
                err: err
            });
        }
    },

    /**
     * 업데이트 처리
     */
    update: (req, res, next) => {
        //console.log("Trace update", req.params.id);
        //console.log(req.body);
        //req.body.processGubun.updatedAt = Date.now();
        try {
            ProcessGubunModel.findOneAndUpdate({
                _id: req.params.id
                //,author: req.user._id
            }, req.body.processGubun, function (err, processGubun) {
                if (err) return res.json({
                    success: false,
                    message: err
                });
                if (!processGubun) return res.json({
                    success: false,
                    message: "No data found to update"
                });
                res.redirect('/processGubun/');
            });
        } catch (e) {
            logger.error(e);
            res.render("http/500", {
                cache : true,
                err: err
            });
        }
    },

    /**
     * 삭제 처리
     */
    delete: (req, res, next) => {
        try {
            ProcessGubunModel.findOneAndRemove({
                _id: req.params.id
            }, function (err, processGubun) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                } else {
                    res.redirect('/processGubun');
                }
            });
        } catch (e) {
            logger.error(e);
            res.render("http/500", {
                cache : true,
                err: err
            });
        }
    },

    /**
     * 처리구분 JSON 조회
     */
    getJSON: (req, res, next) => {
        try {
            async.waterfall([function (callback) {
                //상위코드용 업무처리 개수 조회
                ProcessGubunModel.count({ "higher_cd": req.params.higher_cd, "use_yn":"사용" }, function (err, count) {
                    if (err) return res.json({
                        success: false,
                        message: err
                    });
                    callback(null, count)
                });
            }], function (err, count) {
                var higher_cd = req.params.higher_cd;
                if (count == 0) higher_cd = '000'; //상위코드용 업무처리가 없으면 공통으로 조회
                ProcessGubunModel.find({ "higher_cd": higher_cd, "use_yn":"사용" }, function (err, processGubun) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        res.json(processGubun);
                    }
                }).sort('-process_nm');
            });
        } catch (e) {
            logger.error("manager control saveReceipt : ", e);
            return res.json({
                success: false,
                message: err
            });
        }
    },

    list: (req, res, next) => {
        var search = service.createSearch(req);
    
        async.waterfall([function (callback) {
            ProcessGubunModel.find(search.findIncident, function (err, processGubun) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }
                callback(null, processGubun)
            }).sort('-process_nm');
        }], function (err, processGubun) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            }
            res.send(processGubun);
        });
    },

    getProcessStatus: (req, res, next) => {
        ProcessStatusModel.find({}, function (err, processStatus) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            } else {
                res.json(processStatus);
            }

        }).sort('sort_lvl');
    }
};
