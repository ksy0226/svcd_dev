'use strict';

var express = require('express');
var session = require('express-session');
var mongoose = require('mongoose');
var async = require('async');
var Incident = require('../models/Incident');
var ProcessStatus = require('../models/ProcessStatus');
var ProcessGubun = require('../models/ProcessGubun');
var LowerProcess = require('../models/LowerProcess');
var MyProcess = require('../models/MyProcess');
var Usermanage = require('../models/Usermanage');
var mailer = require('../util/nodemailer');
var alimi = require('../util/alimi');
var service = require('../services/incident');
var logger = require('log4js').getLogger('app');
var Iconv = require('iconv-lite');
var path = require('path');
var moment = require('moment');
var CONFIG = require('../../config/config.json');
var moment = require('moment');

module.exports = {

    /**
     * 인시던트 관리자용 조회 화면
     */
    work_list: (req, res, next) => {

        async.waterfall([function (callback) {
            ProcessStatus.find({}, function (err, status) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }
                callback(null, status);
            }).sort('sort_lvl');
        }, function (status, callback) {

            var condition = {};
            condition.email = req.session.email;

            MyProcess.find(condition).sort('higher_cd').sort('lower_nm').exec(function (err, lowerprocess) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }
                callback(null, status, lowerprocess)
            });
        }], function (err, status, lowerprocess) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                /*
                res.render("manager/work_list", {
                    status: status,
                    lowerprocess: lowerprocess
                });
                */
               var options = {cache: true , title: 'Express'};
                res.render("manager/work_list.jade", {
                    cache: true,
                    status: status,
                    lowerprocess: lowerprocess
                });
            }
        });
    },

    /**
     * 인시던트 관리자용 상세 조회 화면
     */
    work_detail: (req, res, next) => {
        //console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') );
        try {
            async.waterfall([function (callback) {
                Incident.findById({
                    _id: req.params.id
                }, function (err, incident) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        callback(null, incident)
                    }
                });

            }, function (incident, callback) {
                LowerProcess.find({
                    "higher_cd": incident.higher_cd
                }).sort('lower_nm').exec(function (err, lowerprocess) {
                    if (err) {
                        res.render("http/500", {
                            cache : true,
                            err: err
                        });
                    }
                    callback(null, incident, lowerprocess)
                });
            }], function (err, incident, lowerprocess) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                } else {

                    //완료요청일, 등록일, 접수일, 완료예정일, 완료일
                    if (incident.request_complete_date != '') incident.request_complete_date = incident.request_complete_date.substring(0, 10);
                    if (incident.register_date != '') incident.register_date = incident.register_date.substring(0, 10);
                    if (incident.receipt_date != '') incident.receipt_date = incident.receipt_date.substring(0, 10);
                    if (incident.complete_reserve_date != '') incident.complete_reserve_date = incident.complete_reserve_date.substring(0, 10);
                    if (incident.complete_date != '') incident.complete_date = incident.complete_date.substring(0, 10);
                    //incident.complete_date = new Date(incident.complete_date).toISOString().replace(/T/, ' ').replace(/\..+/, '');

                    res.render("manager/work_detail", {
                        cache : true,
                        incident: incident,
                        lowerprocess: lowerprocess
                    });
                }
            });

        } catch (e) {
            logger.error("manager control work_detail : ", e);
        }
    },

    /**
     * Incident 상세 JSON 데이타 조회
     */
    getIncidentDetail: (req, res, next) => {

        //logger.debug("Trace viewDetail : ", req.params.id);
        try {
            Incident.findById({
                _id: req.params.id
            }, function (err, incident) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {
                    //path 길이 잘라내기
                    if (incident.attach_file.length > 0) {
                        for (var i = 0; i < incident.attach_file.length; i++) {
                            var path = incident.attach_file[i].path
                            incident.attach_file[i].path = path.substring(path.indexOf(CONFIG.fileUpload.directory) + CONFIG.fileUpload.directory.length + 1);
                            if (incident.attach_file[i].mimetype != null && incident.attach_file[i].mimetype.indexOf('image') > -1) {
                                incident.attach_file[i].mimetype = 'image';
                            }
                        }
                    }
                    res.send(incident);
                }
            });
        } catch (e) {
            logger.debug('****************', e);
        }
    },

    /**
     * 담당자별 업무 지정
     */
    work_assign: (req, res, next) => {
        Incident.find(req.body.incident, function (err, incident) {
            //logger.debug('err', err, '\n');
            logger.debug('list 호출');
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            }
            res.render("manager/work_assign", {
                cache : true,
                incident: incident
            });
        }).sort('-createdAt');
    },

    /**
     * 담당자 월별 처리 내역
     */
    month_list: (req, res, next) => {
        logger.debug('===============manager month_list===============');
        logger.debug('month_list');
        logger.debug('================================================');

        res.render("manager/month_list",{cache : true});
        /*
        Incident.find(req.body.incident, function (err, incident) {
            //logger.debug('err', err, '\n');
            logger.debug('list 호출');
            if (err) {
                res.render("http/500", {
                    err: err
                });
            }
            res.render("manager/month_list", {
                incident: incident
            });
        }).sort('-created_at');
        */
    },

    /**
     * 회사별 상위업무 지정
     */
    com_process: (req, res, next) => {
        Incident.find(req.body.incident, function (err, incident) {
            //logger.debug('err', err, '\n');
            logger.debug('list 호출');
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            }
            res.render("manager/com_process", {
                cache : true,
                incident: incident
            });
        }).sort('-createdAt');
    },

    /**
     * 접수내용 등록
     */
    saveReceipt: (req, res, next) => {
        ////logger.debug("saveReceipt =====================> " + JSON.stringify(req.body));
        ////logger.debug("req.body.incident : ", req.body.incident);

        try {
            async.waterfall([function (callback) {
                var upIncident = req.body.incident;

                ////logger.debug("=========>1 ", dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds());
                ////logger.debug("=========>2 ", new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''));

                var m = moment();
                var date = m.format("YYYY-MM-DD HH:mm:ss");

                //접수일자 표기 통일하기 위해 수정 (등록일자 형태)

                upIncident.receipt_date = date;
                upIncident.complete_reserve_date = upIncident.complete_reserve_date + " " + upIncident.complete_hh + ":" + upIncident.complete_mi + ":" + "00"
                upIncident.status_cd = '2';
                upIncident.status_nm = '처리중';

                //접수자 세션체크 후 데이타 맵핑
                upIncident.manager_email = req.session.email;
                upIncident.manager_nm = req.session.user_nm;
                upIncident.manager_company_nm = req.session.company_nm;
                upIncident.manager_dept_nm = req.session.dept_nm;
                upIncident.manager_position = req.session.position_nm;
                upIncident.manager_phone = req.session.office_tel_no;

                callback(null, upIncident);
            }], function (err, upIncident) {
                if (err) {
                    res.json({
                        success: false,
                        message: "No data found to update"
                    });
                } else {
                    Incident.findOneAndUpdate({
                        _id: req.params.id
                    }, upIncident, function (err, Incident) {
                        if (err) {
                            return res.json({
                                success: false,
                                message: err
                            });
                        } else {
                            //접수 업데이트 성공 시 메일 전송
                            Usermanage.findOne({
                                email: Incident.request_id
                            }, function (err, usermanage) {
                                if (err) {
                                    return res.json({
                                        success: false,
                                        message: err
                                    });
                                } else {
                                    if (usermanage != null) {
                                        if (usermanage.email_send_yn == 'Y') {
                                            mailer.receiveSend(Incident, upIncident);
                                        }
                                    }
                                }
                            });

                            return res.json({
                                success: true,
                                message: "update successed"
                            });
                        }
                    });
                }
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
     * 업무변경 등록
     */
    saveHChange: (req, res, next) => {

        try {
            async.waterfall([function (callback) {
                var upIncident = req.body.incident;

                var m = moment();
                var date = m.format("YYYY-MM-DD HH:mm:ss");

                upIncident.receipt_content = "* 상/하위업무변경 : " + req.session.user_nm + "-" + date;
                //업무변경 시, 상태값 다시 업데이트 (최예화과장 요청)
                upIncident.status_cd = "1";
                upIncident.status_nm = '접수대기';

                upIncident.manager_company_cd = '';//담당자 회사코드
                upIncident.manager_company_nm = '';//담당자 회사명
                upIncident.manager_nm = '';//담당자 명
                upIncident.manager_dept_cd = '';//담당자 부서코드
                upIncident.manager_dept_nm = '';//담당자 부서명
                upIncident.manager_position = '';//담당자 직위명
                upIncident.manager_email = ''; //담당자 이메일
                upIncident.manager_phone = '';//담당자 전화
                upIncident.receipt_date = ''; //접수일
                upIncident.complete_reserve_date = '';//완료예정일

                //logger.debug("===========================================");
                //logger.debug("saveHChange req.body : " + JSON.stringify(req.body));
                //logger.debug("saveHChange upIncident : " + JSON.stringify(upIncident));
                //logger.debug("===========================================");

                callback(null, upIncident);

            }], function (err, upIncident) {

                //logger.debug("===========================================");
                //logger.debug("saveHChange req.params.id : "+req.params.id )
                //logger.debug("===========================================");

                if (err) {
                    res.json({
                        success: false,
                        message: "No data found to update"
                    });
                } else {

                    //Incident.find({_id: req.params.id}).forEach(function(e){db.myDB.update({"_id":e._id},{$set{"name":'More' + e.name + ' '}});

                    Incident.findOneAndUpdate({
                        _id: req.params.id
                    }, upIncident, function (err, Incident) {
                        if (err) {

                            return res.json({
                                success: false,
                                message: err
                            });
                        } else {

                            //logger.debug("===========================================");
                            //logger.debug("saveHChange Incident : "+Incident )
                            //logger.debug("===========================================");

                            //******************************* */
                            // SD 업무담당자 사내메신저 호출
                            alimi.sendAlimi(req.body.incident.higher_cd);
                            //******************************* */

                            return res.json({
                                success: true,
                                message: "update successed"
                            });

                        }
                    });
                }
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
     * 완료내용 등록
     */
    saveComplete: (req, res, next) => {
        ////logger.debug("saveComplete =====================> " + JSON.stringify(req.body));
        ////logger.debug("req.body.incident : ", req.body.incident);
        try {
            async.waterfall([function (callback) {
                var upIncident = req.body.incident;

                var m = moment();
                var date = m.format("YYYY-MM-DD HH:mm:ss");

                //upIncident.complete_date = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
                upIncident.complete_date = date;
                upIncident.status_cd = '3';
                upIncident.status_nm = '미평가';

                callback(null, upIncident);
            }], function (err, upIncident) {
                if (err) {
                    res.json({
                        success: false,
                        message: "No data found to update"
                    });
                } else {
                    Incident.findOneAndUpdate({
                        _id: req.params.id
                    }, upIncident, function (err, Incident) {
                        if (err) return res.json({
                            success: false,
                            message: err
                        });
                        if (!Incident) {
                            return res.json({
                                success: false,
                                message: "No data found to update"
                            });
                        } else {
                            //완료 업데이트 성공 시 메일 전송
                            Usermanage.findOne({
                                email: Incident.request_id
                            }, function (err, usermanage) {
                                if (err) {
                                    return res.json({
                                        success: false,
                                        message: err
                                    });
                                } else {
                                    if (usermanage != null) {
                                        if (usermanage.email_send_yn == 'Y') {
                                            mailer.finishSend(Incident, upIncident);
                                        }
                                    }
                                }
                            });
                            return res.json({
                                success: true,
                                message: "update successed"
                            });
                        }
                    });
                }
            });

        } catch (e) {
            logger.error("manager control saveComplete : ", e);
            return res.json({
                success: false,
                message: err
            });
        }

    },

    /**
     * 협의필요 내용 등록
     */
    saveHold: (req, res, next) => {
        try {
            async.waterfall([function (callback) {
                var upIncident = req.body.incident;

                var m = moment();
                var date = m.format("YYYY-MM-DD HH:mm:ss");

                //upIncident.complete_date = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
                upIncident.hold_date = date;
                upIncident.status_cd = '5';
                upIncident.status_nm = '협의필요';

                callback(null, upIncident);
            }], function (err, upIncident) {

                Incident.findOneAndUpdate({
                    _id: req.params.id
                }, upIncident, function (err, Incident) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        return res.json({
                            success: true,
                            message: "update successed"
                        });
                    }
                });
            });

        } catch (e) {
            logger.error("manager control saveHold : ", e);
            return res.json({
                success: false,
                message: err
            });
        }

    },

    /**
     * 미처리 내용 등록
     */
    saveNComplete: (req, res, next) => {
        ////logger.debug("saveComplete =====================> " + JSON.stringify(req.body));
        ////logger.debug("req.body.incident : ", req.body.incident);
        try {
            async.waterfall([function (callback) {
                var upIncident = req.body.incident;

                var m = moment();
                var date = m.format("YYYY-MM-DD HH:mm:ss");

                //upIncident.complete_date = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
                upIncident.nc_date = date;
                upIncident.status_cd = '9';
                upIncident.status_nm = '미처리';

                callback(null, upIncident);
            }], function (err, upIncident) {

                Incident.findOneAndUpdate({
                    _id: req.params.id
                }, upIncident, function (err, Incident) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        return res.json({
                            success: true,
                            message: "update successed"
                        });
                    }
                });
            });
        } catch (e) {
            logger.error("manager control saveNComplete : ", e);
            return res.json({
                success: false,
                message: err
            });
        }

    },

    /** 
     * incident 첨부파일 다운로드
     */
    download: (req, res, next) => {
        var filepath = path.join(__dirname, '../../', CONFIG.fileUpload.directory, req.params.path1, req.params.path2);
        res.download(filepath);
        //res.download(filepath, req.params.filename);
    },

    /**
     * 담당자 정보 조회
     */
    getManager: (req, res, next) => {
        try {

            logger.debug("==========================================manager getManager========================================");
            logger.debug("====================================================================================================");

            Usermanage.find({
                    company_cd: "ISU_ST"
                }, function (err, managerJsonData) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {

                        //logger.debug("==========================================CompanyModel.find({}========================================");
                        //logger.debug("companyJsonData : ",companyJsonData);
                        //logger.debug("====================================================================================================");

                        res.json(managerJsonData);
                    };

                })
                .sort({
                    //group_flag: -1,
                    manager_nm: 1
                });
        } catch (e) {
            logger.error("getManager error : ", e);
        } finally {}
    },

};