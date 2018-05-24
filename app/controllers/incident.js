'use strict';

const mongoose = require('mongoose');
const async = require('async');
const Incident = require('../models/Incident');
const CompanyProcess = require('../models/CompanyProcess');
const ProcessStatus = require('../models/ProcessStatus');
const LowerProcess = require('../models/LowerProcess');
const Usermanage = require('../models/Usermanage');
const MyProcess = require('../models/MyProcess');
const service = require('../services/incident');
const moment = require('moment');
var mailer = require('../util/nodemailer');
var alimi = require('../util/alimi');
var fs = require('fs');
var path = require('path');
var CONFIG = require('../../config/config.json');
var logger = require('log4js').getLogger('app');

var request = require("request");

module.exports = {
    /** 
     * incident 조회 화면
     */
    index: (req, res, next) => {
        async.waterfall([function (callback) {
            ProcessStatus.find({}, function (err, ProcessStatus) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }
                callback(null, ProcessStatus)
            }).sort('-created_at');
        }], function (err, ProcessStatus) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                res.render("incident/index", {
                    cache : true,
                    ProcessStatus: ProcessStatus
                });
            }
        });
    },

    /** 
     * incident 등록 화면
     */
    new: (req, res, next) => {
        async.waterfall([function (callback) {

            CompanyProcess.find({
                "company_cd": req.session.company_cd
            }, function (err, companyProcess) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }
                callback(null, companyProcess)
            });
        }], function (err, companyProcess) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            }

            var real_contact = "";
            if (req.session.office_tel_no != "") {
                real_contact = req.session.office_tel_no;
            } else if (req.session.hp_telno != "") {
                real_contact = req.session.hp_telno;
            } else if (req.session.email != "") {
                real_contact = req.session.email;
            }

            res.render("incident/new", {
                cache : true,
                companyProcess: companyProcess,
                user_nm: req.session.user_nm,
                sabun: req.session.sabun,
                office_tel_no: req.session.office_tel_no,
                hp_telno: req.session.hp_telno,
                real_contact: real_contact,
                title: req.query.title,
                content: req.query.content,
                higher_cd: req.query.higher_cd
            });
        });
    },

    /** 
     * incident 등록 화면(담당자)
     */
    new_mng: (req, res, next) => {
        res.render("incident/new_mng",{cache : true});
        //res.render("incident/new_mng");
        /*
        async.waterfall([function (callback) {
            CompanyProcess.find({ "company_cd": req.session.company_cd }, function (err, companyProcess) {
                if (err) {
                    res.render("http/500", {
                        err: err
                    });
                }
                callback(null, companyProcess)
            });
        }], function (err, companyProcess) {
            if (err) {
                res.render("http/500", {
                    err: err
                });
            }
            var real_contact = req.session.office_tel_no + '/';
            real_contact += req.session.hp_telno + '/';
            real_contact += req.session.email + '/';
            if (real_contact == "//") real_contact = "";

            res.render("incident/new_mng", {
                companyProcess: companyProcess,
                user_nm: req.session.user_nm,
                sabun: req.session.sabun,
                office_tel_no: req.session.office_tel_no,
                hp_telno: req.session.hp_telno,
                real_contact: real_contact
            });
        });
        */

    },


    /** 
     * incident 저장
     */
    save: (req, res, next) => {

        async.waterfall([function (callback) {
            var newincident = req.body.incident;
            //TODO
            //추가수정
            newincident.request_company_cd = req.session.company_cd;
            newincident.request_company_nm = req.session.company_nm;
            newincident.request_dept_nm = req.session.dept_nm;
            newincident.request_nm = req.session.user_nm;
            newincident.request_id = req.session.email;

            //추가수정
            newincident.register_company_cd = req.session.company_cd;
            newincident.register_company_nm = req.session.company_nm;
            newincident.register_nm = req.session.user_nm;
            newincident.register_id = req.session.email;


            if (req.files) {
                newincident.attach_file = req.files;
            }
            Incident.create(newincident, function (err, newincident) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }

                //******************************* */
                // SD 업무담당자 사내메신저 호출
                alimi.sendAlimi(req.body.incident.higher_cd);
                //******************************* */

                callback(null);
            });
        }], function (err) {
            //logger.debug("trace 2");
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            }

            ProcessStatus.find({}, function (err, ProcessStatus) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                } else {
                    res.render("incident/index", {
                        cache : true,
                        ProcessStatus: ProcessStatus
                    });
                }
            });

        });
    },

    /** 
     * incident 상담접수(전화) 저장
     */
    mng_save: (req, res, next) => {
        async.waterfall([function (callback) {
            var newincident = req.body.incident;

            //등록자
            newincident.register_company_cd = req.session.company_cd;
            newincident.register_company_nm = req.session.company_nm;
            newincident.register_nm = req.session.user_nm;
            newincident.register_id = req.session.user_id;

            if (req.files) {
                newincident.attach_file = req.files;
            }
            Incident.create(newincident, function (err, newincident) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }

                //******************************* */
                // SD 업무담당자 사내메신저 호출
                alimi.sendAlimi(req.body.incident.higher_cd);
                //******************************* */

                callback(null);
            });
        }], function (err) {
            //logger.debug("trace 2");
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                async.waterfall([function (callback) {
                    ProcessStatus.find({}, function (err, status) {
                        if (err) {
                            res.render("http/500", {
                                cache : true,
                                err: err
                            });
                        }
                        callback(null, status);
                    });
                }, function (status, callback) {
                    LowerProcess.find().sort('higher_cd').sort('lower_nm').exec(function (err, lowerprocess) {
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
                        res.render("manager/work_list", {
                            cache : true,
                            status: status,
                            lowerprocess: lowerprocess
                        });
                    }
                });
            }
        });
    },

    /** 
     * incident 상세 화면
     */
    show: (req, res, next) => {
        res.render("incident/show", {
            cache : true,
            incident: incident,
            urlQuery: req._parsedUrl.query,
            user: req.user,
            search: service.createSearch(req)
        });
    },

    /** 
     * incident 수정 화면
     */
    /*
    edit: (req, res, next) => {
        res.render("incident/edit", {
            cache : true,
            incident: incident,
            user: req.user
        });
    },
    */

    

    /** 
     * incident 수정 등록
     */
    update: (req, res, next) => {
        res.redirect('/incident/' + req.params.id + '/show');
    },

    /**
     * incident 삭제 
     */
    delete: (req, res, next) => {
        

        Incident.findOneAndRemove({
            _id: req.params.id
            //,author: req.user._id
        }, function (err, incident) {
            if (err) return res.json({
                success: false,
                message: err
            });
            if (!incident) return res.json({
                success: false,
                message: "No data found to delete"
            });
            res.send(incident);
        });
    },

    deleteIncident: (req, res, next) => {
      
        Incident.findOneAndRemove({
            _id: req.params.id
            //,author: req.user._id
        }, function (err, incident) {
            if (err){ 
                return res.json({
                    success: false,
                message: err
                });
            }else if (!incident){ return res.json({
                    success: false,
                    message: "No data found to delete"
                });
            }else{
                return res.json({
                    success: true,
                    message: "삭제되었습니다."
                });
            }
        });
    },

    /** 
     * incident 상세 화면 조회
     */
    viewDetail: (req, res, next) => {
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
                            if(path.indexOf(CONFIG.fileUpload.directory) > -1){
                                incident.attach_file[i].path = path.substring(path.indexOf(CONFIG.fileUpload.directory) + CONFIG.fileUpload.directory.length + 1);
                            }else{
                                incident.attach_file[i].path = incident.attach_file[i].path + "/" + incident.attach_file[i].filename;
                            }

                            //logger.debug("=============================================");
                            //logger.debug("incident.attach_file[i].path 1 : ", incident.attach_file[i].path);
                            //logger.debug("incident.attach_file[i].filename 1 : ", incident.attach_file[i].filename);
                            //logger.debug("incident.attach_file[i].originalname 1 : ", incident.attach_file[i].originalname);
                            //logger.debug("=============================================");


                            if (incident.attach_file[i].mimetype != null && incident.attach_file[i].mimetype.indexOf('image') > -1) {
                                incident.attach_file[i].mimetype = 'image';
                            }
                        }
                    }
                    res.render("incident/viewDetail", {
                        cache : true,
                        incident: incident,
                        user: req.user
                    });

                    /*모달형식
                    res.send(incident);
                    */
                }
            });
        } catch (e) {
            //logger.debug('incident viewDetail error : ', e);
        }
    },

    /** 
     * incident 첨부파일 다운로드
     */
    download: (req, res, next) => {
        var filepath = path.join(__dirname, '../../', CONFIG.fileUpload.directory, req.params.path1, req.params.path2);
        res.download(filepath, req.params.filename);
    },

    /**
     * 사용자별 Incident 조회
     */
    userlist: (req, res, next) => {

        var search = service.createSearch(req);
        
        if (search.findIncident.$and == null) {
            
            search.findIncident.$and = [{
                "request_id": req.session.email
            }];
         
        } else {

          
            search.findIncident.$and.push({
                "request_id": req.session.email
            });
        }

        var page = 1;
        var perPage = 3;

        if (req.query.page != null && req.query.page != '') page = Number(req.query.page);
        if (req.query.perPage != null && req.query.perPage != '') perPage = Number(req.query.perPage);

        //logger.debug("=============================================");
        //logger.debug("page : ", page);
        //logger.debug("perPage : ", perPage);
        //logger.debug("req.query.perPage : ", req.query.perPage);
        //logger.debug("=============================================");

        try {

            async.waterfall([function (callback) {

                //logger.debug("=============================================");
                //logger.debug("req.session.email : "+req.session.email);                
                //logger.debug("search.findIncident : "+JSON.stringify(search.findIncident));
                //logger.debug("=============================================");

                Incident.count(search.findIncident, function (err, totalCnt) {

                    if (err) {

                        //logger.debug("=============================================");
                        //logger.debug("incident : ", err);
                        //logger.debug("=============================================");

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
                })
            }], function (err, totalCnt) {

                Incident.find(search.findIncident, function (err, incident) {
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

        } finally {}

    },
    /**
     * Incident 조회
     */
    getIncident: (req, res, next) => {
    
        var search = service.createSearch(req);
        var page = 1;
        var perPage = 15;

        if (req.query.page != null && req.query.page != '') page = Number(req.query.page);
        if (req.query.perPage != null && req.query.perPage != '') perPage = Number(req.query.perPage);

        //logger.debug("===============search control================");
        //logger.debug("req.query.higher_cd : ", req.query.higher_cd);
        //logger.debug("req.query.lower_cd : ", req.query.lower_cd);
        //logger.debug("search.findIncident : ", JSON.stringify(search.findIncident));
        //logger.debug("=============================================");

        try {

            async.waterfall([function (callback) {

                //상위업무가 전체이고, SD 담당자일때만 나의 상위 업무만 조회
                if (req.session.user_flag == "1" || req.session.user_flag == "4" || (req.query.user == "manager" && req.session.user_flag == "3")) {

                    var condition = {};
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
                            //{"$and":[{"higher_cd":{"$in":["H004","H006","H012","H024","H001"]}}]}
                            
                            if(req.query.status_cd != "1" && req.query.status_cd != "5"){
                                search.findIncident.$and.push({"manager_email":req.session.email})
                            }


                        } else {

                            //logger.debug("=============================================");
                            //logger.debug("search.findIncident.$and is not null : ", myHigherProcess);
                            //logger.debug("=============================================");

                            search.findIncident.$and.push({
                                "higher_cd": {
                                    "$in": myHigherProcess
                                }
                            });
                            
                            if(req.query.status_cd != "1" && req.query.status_cd != "5"){
                                search.findIncident.$and.push({"manager_email":req.session.email})
                            }

                            //'$and': [ { lower_cd: 'L004' } ] }
                        }

                        logger.debug("getIncident =============================================");
                        logger.debug("page : ", page);
                        logger.debug("perPage : ", perPage);
                        logger.debug("req.query.perPage : ", req.query.perPage);
                        logger.debug("search.findIncident : ", JSON.stringify(search.findIncident));
                        logger.debug("getIncident =============================================");

                        callback(err);
                    });
                } else {
                    callback(null);
                }

            },
            function (callback) {

                Incident.count(search.findIncident, function (err, totalCnt) {
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

            Incident.find(search.findIncident, function (err, incident) {
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

        } finally {}

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
                            if(path.indexOf(CONFIG.fileUpload.directory) > -1){
                                incident.attach_file[i].path = path.substring(path.indexOf(CONFIG.fileUpload.directory) + CONFIG.fileUpload.directory.length + 1);
                            }else{
                                incident.attach_file[i].path = incident.attach_file[i].path + "/" + incident.attach_file[i].filename;
                            }

                            //logger.debug("=============================================");
                            //logger.debug("incident.attach_file[i].path 2 : ", incident.attach_file[i].path);
                            //logger.debug("incident.attach_file[i].filename 2 : ", incident.attach_file[i].filename);
                            //logger.debug("incident.attach_file[i].originalname 2 : ", incident.attach_file[i].originalname);
                            //logger.debug("=============================================");

                            if (incident.attach_file[i].mimetype != null && incident.attach_file[i].mimetype.indexOf('image') > -1) {
                                incident.attach_file[i].mimetype = 'image';
                            }
                            
                        }
                    }

                    res.send(incident);
                }
            });
        } catch (e) {
            //logger.debug('****************', e);
        }
    },



    /**
     * summernote 이미지링크 처리
     */
    insertedImage: (req, res, next) => {
        //console.log("image upload .....");
        //res.send( '/uploads/' + req.file.filename);
        //logger.debug("=====================>incident controllers insertedImage");
        res.send('/uploads/' + req.file.filename);
    },

    /**
     * 서비스 평가 내용 등록
     */
    valuationSave: (req, res, next) => {
        //logger.debug("valuationSave =====================> " + JSON.stringify(req.body));
        //logger.debug("req.body.incident : ", req.body.incident);
        try {
            async.waterfall([function (callback) {
                var upIncident = req.body.incident;
                upIncident.status_cd = '4';
                upIncident.status_nm = '처리완료';
                callback(null, upIncident);
            }], function (err, upIncident) {
                //logger.debug("=========> upIncident ", upIncident);

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
                            //평가 완료 업데이트 성공 시 메일 전송
                            Usermanage.findOne({
                                email: Incident.request_id
                            }, function (err, usermanage) {
                                if (err) {
                                    return res.json({
                                        success: false,
                                        message: err
                                    });
                                } else {
                                    if(usermanage != null){
                                        if (usermanage.email_send_yn == 'Y') {
                                            mailer.evaluationSend(Incident, upIncident);
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
            logger.error("incident control valuationSave : ", e);
            return res.json({
                success: false,
                message: err
            });
        }
    },

    /**
     * 엑셀다운로드 기능
     */
    exceldownload: (req, res, next) => {
        //logger.debug("=============================================");
        //logger.debug("exceldownload : ");
        //logger.debug("=============================================");

        /*
        //기존 엑셀다운로드
        var search = service.createSearch(req);


        async.waterfall([function (callback) {

                //상위업무가 전체이고, SD 담당자일때만 나의 상위 업무만 조회
                if (req.query.higher_cd == "*" && req.session.user_flag == "4") {

                    //나의 상위 업무만 조회
                    var condition = {};
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
                            //{"$and":[{"higher_cd":{"$in":["H004","H006","H012","H024","H001"]}}]}
                        } else {

                            //logger.debug("=============================================");
                            //logger.debug("search.findIncident.$and is not null : ", myHigherProcess);
                            //logger.debug("=============================================");

                            search.findIncident.$and.push({
                                "higher_cd": {
                                    "$in": myHigherProcess
                                }
                            });
                            //'$and': [ { lower_cd: 'L004' } ] }
                        }
                        callback(null);
                    });
                } else {
                    callback(null);
                }



            },
            function (callback) {
                Incident.find(search.findIncident, function (err, incident) {
                    //우선 주석처리
                    //Incident.find(search.findIncident)
                    //.select ('status_nm higher_nm lower_nm title content')
                    //.exec(function (err, incident) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    }

                    //logger.debug("=============================================");
                    //logger.debug("incident count : ", incident.length);
                    //logger.debug("=============================================");
                    
                    callback(null, incident)
                })
            }
        ], function (err, incident) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            }
            //console.log(incident);
            res.json(incident);
        });

    }
    */
    var search = service.createSearch(req);

        var condition = {};
        /*
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
        */

        //logger.debug("===============search control================");
        //logger.debug(" exceldownload search.findIncident : ", JSON.stringify(search.findIncident));
        //logger.debug("=============================================");

        try {

            async.waterfall([function (callback) {

                //상위업무가 전체이고, SD 담당자일때만 나의 상위 업무만 조회
                if (req.query.higher_cd == "*" && (req.session.user_flag == "3" || req.session.user_flag == "4")) {


                    condition.email = req.session.email;

                    MyProcess.find(condition).distinct('higher_cd').exec(function (err, myHigherProcess) {

                        if (search.findIncident.$and == null) {

                            //logger.debug("=============================================");
                            //logger.debug("exceldownload search.findIncident.$and is null : ", myHigherProcess);
                            //logger.debug("=============================================");

                            search.findIncident.$and = [{
                                "higher_cd": {
                                    "$in": myHigherProcess
                                }
                            }];
                        } else {

                            //logger.debug("=============================================");
                            //logger.debug("exceldownload search.findIncident.$and is not null : ", myHigherProcess);
                            //logger.debug("=============================================");

                            search.findIncident.$and.push({
                                "higher_cd": {
                                    "$in": myHigherProcess
                                }
                            });
                        }

                        //logger.debug("exceldownload =============================================");
                        //logger.debug("exceldownload search.findIncident : ", search.findIncident);
                        //logger.debug("exceldownload =============================================");

                        callback(null);
                    });
                } else {
                    callback(null);
                }

            },
            function (callback) {
                Incident.count(search.findIncident, function (err, totalCnt) {
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

                Incident.find(search.findIncident, function (err, incident) {
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
                        //var rtnData = {};
                        //rtnData.incident = incident;
                        //rtnData.totalCnt = totalCnt

                        //logger.debug("=============================================");
                        //logger.debug("rtnData.totalCnt : ", rtnData.totalCnt);
                        //logger.debug("rtnData : ", JSON.stringify(rtnData));
                        //logger.debug("=============================================");

                        res.json(incident);

                    }
                })
                    .sort('-register_date');
            });
        } catch (err) {

            //logger.debug("===============search control================");
            //logger.debug("search list error : ", err);
            //logger.debug("=============================================");

        } finally { }
    },
    /**
     * Incident 상세 JSON 데이타 조회
     */
    reRegister: (req, res, next) => {

        logger.debug("reRegister ...... : ", req.params.id);


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
                    logger.debug('****************', incident);

                    //res.json(incident);

                    
                    res.render("incident/reRegister", {
                        incident : incident
                    });
                    
                   //res.render("incident/reRegister", {
                   // incident: incident
                ///});
                }
            });
        } catch (e) {
            logger.debug('****************', e);
        }
    },

    /**
     * Incident 상세 JSON 데이타 조회
     */
    edit: (req, res, next) => {

        logger.debug("edit ...... : ", req.params.id);


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
                    logger.debug('****************', incident);

                    //res.json(incident);

                    
                    res.render("incident/edit", {
                        incident : incident,
                        user_nm: req.session.user_nm

                    });
                    
                   //res.render("incident/reRegister", {
                   // incident: incident
                ///});
                }
            });
        } catch (e) {
            logger.debug('****************', e);
        }
    },
}



