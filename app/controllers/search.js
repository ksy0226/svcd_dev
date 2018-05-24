'use strict';

const mongoose = require('mongoose');
const async = require('async');
const CompanyModel = require('../models/Company');
const IncidentModel = require('../models/Incident');
const HigherProcessModel = require('../models/HigherProcess');
const LowerProcessModel = require('../models/LowerProcess');
const CompanyProcessModel = require('../models/CompanyProcess');
const OftenQnaModel = require('../models/OftenQna');
const service = require('../services/incident');
const service2 = require('../services/oftenqna');
const logger = require('log4js').getLogger('app');
const Iconv = require('iconv-lite');
var path = require('path');
var CONFIG = require('../../config/config.json');
var MyProcess = require('../models/MyProcess');

module.exports = {

    /**
     * 사용자별 리스트 > 상위업무 가져오기
     */

    user_list: (req, res, next) => {
        try {

            var condition = {}; //조건
            condition.company_cd = req.session.company_cd; //회사코드
            //condition.email         = req.session.email; //이메일

            //logger.debug("==========================================");
            //logger.debug("condition : ", condition);
            //logger.debug("==========================================");

            CompanyProcessModel.find(condition, function (err, myProcess) {
                if (err) {
                    res.json({
                        success: false,
                        message: err
                    });
                } else {

                    //logger.debug("==========================================");
                    //logger.debug("myProcess : ",JSON.stringify(myProcess));
                    //console.log("myProcess : ",JSON.stringify(myProcess));
                    //logger.debug("===========================================");

                    res.render("search/user_list", {
                        cache : true,
                        myProcess: myProcess
                    });
                }
            });

        } catch (e) {
            logger.error("myProcess controllers getMyProcess : ", e);
        } finally { }

    },


    /**
     * 사용자별 상세조회 > Incident 가져오기
     */
    user_detail: (req, res, next) => {
        //logger.debug("Trace user_detail : ", req.params.id);
        try {
            IncidentModel.findById({
                _id: req.params.id
            }, function (err, incident) {
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

                    res.render("search/user_detail", {
                        cache : true,
                        incident: incident
                    });
                }
            });
        } catch (e) {
            //logger.debug(e);
            res.render("http/500", {
                cache : true,
                err: err
            });
        }
    },

    /**
     * 사용자 자주묻는 질문과 답
     */
    user_qna: (req, res, next) => {
        async.waterfall([function (callback) {
            HigherProcessModel.find({}, function (err, higherprocess) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }
                callback(null, higherprocess)
            });
        }], function (err, higherprocess) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                res.render("search/user_qna", {
                    cache : true,
                    higherprocess: higherprocess
                });
            }
        });
    },

    /**
     * 자주묻는 질문과 답 상세조회 > OfteQna 가져오기
     */
    qna_detail: (req, res, next) => {

        //logger.debug("Trace qna_detail : ", req.params.id);

        try {
            OftenQnaModel.findById({
                _id: req.params.id
            }, function (err, oftenqna) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {
                    //path 길이 잘라내기
                    if (oftenqna.attach_file.length > 0) {
                        for (var i = 0; i < oftenqna.attach_file.length; i++) {
                            var path = oftenqna.attach_file[i].path
                            oftenqna.attach_file[i].path = path.substring(path.indexOf(CONFIG.fileUpload.directory) + CONFIG.fileUpload.directory.length + 1);
                            if (oftenqna.attach_file[i].mimetype != null && oftenqna.attach_file[i].mimetype.indexOf('image') > -1) {
                                oftenqna.attach_file[i].mimetype = 'image';
                            }
                        }
                    }
                    res.json(oftenqna);
                }
            });
        } catch (e) {
            //logger.debug('****************', e);
        }
    },

    /**
     * 전체 조회(관리자용)
     */
    mng_list: (req, res, next) => {

        try {
            res.render("search/mng_list",{cache : true})
        } catch (e) {

            logger.error("=============================================");
            logger.error("search.mng_list err : ", e);
            logger.error("=============================================");

        } finally { }

    },
    /**
     * 사용자별 상세조회 > Incident 가져오기
     */
    mng_detail: (req, res, next) => {

        //logger.debug("Trace mng_detail : ", req.params.id);
        IncidentModel.findById({
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
                        if (incident.attach_file[i].mimetype.indexOf('image') > -1) {
                            incident.attach_file[i].mimetype = 'image';
                        }
                    }
                }



                //완료요청일, 등록일, 접수일, 완료예정일, 완료일
                //if(incident.request_complete_date != '') incident.request_complete_date = incident.request_complete_date.substring(0,10);
                //if(incident.register_date != '') incident.register_date = incident.register_date.substring(0,10);
                //if(incident.receipt_date != '') incident.receipt_date = incident.receipt_date.substring(0,10);
                //if(incident.complete_reserve_date != '') incident.complete_reserve_date = incident.complete_reserve_date.substring(0,10);
                //if(incident.complete_date != '') incident.complete_date = incident.complete_date.substring(0,10);
                //incident.complete_date = new Date(incident.complete_date).toISOString().replace(/T/, ' ').replace(/\..+/, '');



                res.render("search/mng_detail", {
                    cache : true,
                    incident: incident
                });
            }
        });
    },

    /** 
     * incident 첨부파일 다운로드
     */
    download: (req, res, next) => {

        //logger.error("===============model.search.download=============");
        //logger.error("req.params.path1 ", req.params.path1);
        //logger.error("req.params.path2 ", req.params.path2);
        //logger.error("req.params.filename ", req.params.filename);
        //logger.error("=================================================");

        var filepath = path.join(__dirname, '../../', CONFIG.fileUpload.directory, req.params.path1, req.params.path2);
        res.download(filepath, req.params.filename);
    },

    /**
     * 연도별 미처리 리스트
     */
    remain_list: (req, res, next) => {
        try {
            res.render("search/remain_list",{cache : true})
        } catch (e) {

            logger.error("=============================================");
            logger.error("search.remain_list err : ", e);
            logger.error("=============================================");

        } finally { }
    },
     
    getRemainList: (req, res, next) => {
       
        //logger.debug("=============================================");
        //logger.debug("search.remain_list  : ");
        //logger.debug("=============================================");
        
        var search = service.createSearch(req);
        
        var page = 1;
        var perPage = 15;
        var condition = {};
        //condition.solution_flag ='N';

        if (req.query.page != null && req.query.page != '') page = Number(req.query.page);
        if (req.query.perPage != null && req.query.perPage != '') perPage = Number(req.query.perPage);
        
        //미처리현황 페이지 구분 gbn=remain
        if(req.query.gbn == 'remain'){
            //조건추가 해결여부 'N' 
            if (search.findIncident.$and == null) {
                search.findIncident.$and = [{
                    "solution_flag": "N"
                }];
            } else {
                search.findIncident.$and.push({
                    "solution_flag": "N"
                });
            }
            
            //조건추가 진행상태 '1' 제외
            if (search.findIncident.$and == null) {
                search.findIncident.$and = [{
                    $or: [{
                        status_cd: "3"
                    }, {
                        status_cd: "4"
                    },{
                        status_cd: "5"
                    }]
                }];
            } else {
                search.findIncident.$and.push({
                    $or: [{
                        status_cd: "3"
                    }, {
                        status_cd: "4"
                    },{
                        status_cd: "5"
                    }]
                });
            }
        }
        if (req.query.user != 'managerall' && req.query.gbn != 'remain') {

            //logger.debug("===============search remain_list ======================================");
            //logger.debug(" remain_list req.query.user  : ", req.query.user );
            //logger.debug("========================================================================");

            if (search.findIncident.$and == null) {

                search.findIncident.$and = [{
                    "request_id": req.session.email
                }];

            } else {

                search.findIncident.$and.push({
                    "request_id": req.session.email
                });
            }
        }
        //logger.debug("===============search remain_list control======================================");
        //logger.debug(" remain_list search.findIncident : ", JSON.stringify(search.findIncident));
        //logger.debug("===============================================================================");
        try {
        
            async.waterfall([function (callback) {
                //상위업무가 전체이고, SD 담당자일때만 나의 상위 업무만 조회
                if (req.query.higher_cd == "*" && (req.session.user_flag == "3" || req.session.user_flag == "4")) {

                    condition.email = req.session.email;

                    MyProcess.find(condition).distinct('higher_cd').exec(function (err, myHigherProcess) {

                        if (search.findIncident.$and == null) {

                            //logger.debug("=============================================");
                            //logger.debug("search.findIncident.$and is null : ", myHigherProcess);
                            //logger.debug("=============================================");

                            search.findIncident.$and = [{
                                "higher_cd": {
                                    "$in": myHigherProcess
                                }
                            }];
                        } else {

                            //logger.debug("=============================================");
                            //logger.debug("search.findIncident.$and is not null : ", myHigherProcess);
                            //logger.debug("=============================================");

                            search.findIncident.$and.push({
                                "higher_cd": {
                                    "$in": myHigherProcess
                                }
                            });
                        }
                        //logger.debug("getIncident =============================================");
                        //logger.debug("page : ", page);
                        //logger.debug("perPage : ", perPage);
                        //logger.debug("req.query.perPage : ", req.query.perPage);
                        //logger.debug("search.findIncident : ", search.findIncident);
                        //logger.debug("getIncident =============================================");

                        callback(null);
                    });
                } else {
                    //logger.debug("else =============================================");
                    //logger.debug("test : ");
                    //logger.debug("else =============================================");
                    callback(null);
                }
            },
            function (callback) {
                IncidentModel.count(search.findIncident, function (err, totalCnt) {
                    if (err) {
                        //logger.error("incident : ", err);

                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {

                        //logger.debug("=============================================");
                        //logger.debug("incidentCnt : ", totalCnt);
                        //logger.debug("=============================================");

                        callback(null, totalCnt)
                    }
                });
            }
            ], function (err, totalCnt) {

                IncidentModel.find(search.findIncident, function (err, incident) {
                    if (err) {

                        //logger.debug("=============================================");
                        //logger.debug("incident : ", err);
                        //logger.debug("=============================================");

                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {

                        //incident에 페이징 처리를 위한 전체 갯수전달
                        var rtnData = {};
                        rtnData.incident = incident;
                        rtnData.totalCnt = totalCnt

                        //logger.debug("=============================================");
                        //logger.debug("rtnData.totalCnt : ", rtnData.totalCnt);
                        //logger.debug("rtnData : ", JSON.stringify(rtnData));
                        //logger.debug("=============================================");

                        res.json(rtnData);

                    }
                })
                    .sort('-register_date')
                    .skip((page - 1) * perPage)
                    .limit(perPage);
            });
        
        } catch (err) {

            //logger.debug("===============search control================");
            //logger.debug("search remain_list error : ", err);
            //logger.debug("=============================================");

        } finally { }
        
        
    },

    /**
     * 진행 상태별 인시던트 조회
     */
    status_list: (req, res, next) => {

        IncidentModel.find(req.body.incident, function (err, incident) {
            //logger.debug('err', err, '\n');
            //logger.debug('list 호출');
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            }
            res.render("search/status_list", {
                cache : true,
                incident: incident
            });
        });
    },
 

    /**
     * 하위업무 리스트 조회
     */
    getlowerprocess: (req, res, next) => {
        var condition = {};
        if (req.query.higher_cd != null) {
            condition.higher_cd = req.query.higher_cd;
        }

        LowerProcessModel.find(condition, function (err, lowerprocess) {

            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            } else {
                res.json(lowerprocess);
            }
        }).sort('lower_nm');
    },

    /**
     * user_list 데이터 조회
     */
    list: (req, res, next) => {

        var search = service.createSearch(req);

        var page = 1;
        var perPage = 15;
        var condition = {};

        if (req.query.page != null && req.query.page != '') page = Number(req.query.page);
        if (req.query.perPage != null && req.query.perPage != '') perPage = Number(req.query.perPage);

        if (req.query.user != 'managerall') {
            if (search.findIncident.$and == null) {

                search.findIncident.$and = [{
                    "request_id": req.session.email
                }];

            } else {

                search.findIncident.$and.push({
                    "request_id": req.session.email
                });
            }
        }

        //logger.debug("===============search control================");
        //logger.debug("page : ", page);
        //logger.debug("perPage : ", perPage);
        //logger.debug(" list search.findIncident : ", JSON.stringify(search.findIncident));
        //logger.debug("=============================================");

        try {

            async.waterfall([function (callback) {

                //상위업무가 전체이고, SD 담당자일때만 나의 상위 업무만 조회
                if (req.query.higher_cd == "*" && (req.session.user_flag == "3" || req.session.user_flag == "4")) {


                    condition.email = req.session.email;

                    MyProcess.find(condition).distinct('higher_cd').exec(function (err, myHigherProcess) {

                        if (search.findIncident.$and == null) {

                            //logger.debug("=============================================");
                            //logger.debug("search.findIncident.$and is null : ", myHigherProcess);
                            //logger.debug("=============================================");

                            search.findIncident.$and = [{
                                "higher_cd": {
                                    "$in": myHigherProcess
                                }
                            }];
                        } else {

                            //logger.debug("=============================================");
                            //logger.debug("search.findIncident.$and is not null : ", myHigherProcess);
                            //logger.debug("=============================================");

                            search.findIncident.$and.push({
                                "higher_cd": {
                                    "$in": myHigherProcess
                                }
                            });
                        }

                        //logger.debug("getIncident =============================================");
                        //logger.debug("page : ", page);
                        //logger.debug("perPage : ", perPage);
                        //logger.debug("req.query.perPage : ", req.query.perPage);
                        //logger.debug("search.findIncident : ", search.findIncident);
                        //logger.debug("getIncident =============================================");

                        callback(null);
                    });
                } else {
                    callback(null);
                }

            },
            function (callback) {
                IncidentModel.count(search.findIncident, function (err, totalCnt) {
                    if (err) {
                        logger.error("incident : ", err);

                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {

                        //logger.debug("=============================================");
                        //logger.debug("incidentCnt : ", totalCnt);
                        //logger.debug("=============================================");

                        callback(null, totalCnt)
                    }
                });
            }
            ], function (err, totalCnt) {

                IncidentModel.find(search.findIncident, function (err, incident) {
                    if (err) {

                        //logger.debug("=============================================");
                        //logger.debug("incident : ", err);
                        //logger.debug("=============================================");

                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {

                        //incident에 페이징 처리를 위한 전체 갯수전달
                        var rtnData = {};
                        rtnData.incident = incident;
                        rtnData.totalCnt = totalCnt

                        //logger.debug("=============================================");
                        //logger.debug("rtnData.totalCnt : ", rtnData.totalCnt);
                        //logger.debug("rtnData : ", JSON.stringify(rtnData));
                        //logger.debug("=============================================");

                        res.json(rtnData);

                    }
                })
                    .sort('-register_date')
                    .skip((page - 1) * perPage)
                    .limit(perPage);
            });
        } catch (err) {

            //logger.debug("===============search control================");
            //logger.debug("search list error : ", err);
            //logger.debug("=============================================");

        } finally { }
    },
    /**
     * user_qna 데이터 조회
     */
    getqnalist: (req, res, next) => {
        var search2 = service2.createSearch(req);

        //logger.debug("=====================> " + JSON.stringify(search2));
        //console.log("search"+ JSON.stringify(search));

        try {
            async.waterfall([function (callback) {
                OftenQnaModel.find(search2.findOftenqna, function (err, oftenqna) {
                    if (err) {
                        res.render("http/500", {
                            cache : true,
                            err: err
                        });
                    } else {
                        callback(null, oftenqna)
                    }
                }).sort("-" + search2.order_by);
            }], function (err, oftenqna) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                } else {
                    res.send(oftenqna);
                }
            });
        } catch (e) {
            //logger.debug('oftenqna controllers error ====================> ', e)
        }
    }

};