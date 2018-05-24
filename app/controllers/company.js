'use strict';

const mongoose = require('mongoose');
const async = require('async');
const CompanyModel = require('../models/Company');
const UsermanageModel = require('../models/Usermanage');
const IncidentModel = require('../models/Incident');
const service = require('../services/company');
const logger = require('log4js').getLogger('app');
const Iconv = require('iconv-lite');

module.exports = {

    index: (req, res, next) => {
        CompanyModel.find(req.body.company, function (err, company) {
            logger.debug('list 호출');
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                res.render("company/index", {
                    cache : true,
                    company: company
                });
            }
        });
    },

    new: (req, res, next) => {
        res.render("company/new",{cache : true});
    },

    save: (req, res, next) => {
        var company = req.body.company;
        logger.debug('body', req.body);

        CompanyModel.create(req.body.company, function (err, company) {
            logger.debug('save 호출');
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                res.redirect('/company',{cache : true});
            }
        });
    },

    edit: (req, res, next) => {
        CompanyModel.findById(req.params.id, function (err, company) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                res.render("company/edit", {
                    cache : true,
                    company: company
                });
            }
        }).sort({
            group_flag: -1,
            company_nm: 1
        });
    },

    update: (req, res, next) => {
        try{

            //logger.debug("=================================")
            //logger.debug("req.body.company ",JSON.stringify(req.body.company));
            //logger.debug("=================================")

            async.waterfall([function (callback) {
                CompanyModel.findOneAndUpdate({
                    _id: req.params.id
                }, req.body.company, function (err, company) {
                    if (err) {
                        res.render("http/500", {
                            cache : true,
                            err: err
                        });
                    } else {
                        callback(null);
                    }
                });
            }, function (callback){
                var condition = {};
                var setQuery = {};
                var option = {};
                condition.request_company_cd = req.body.company.company_cd;
                setQuery.$set = { "request_company_nm" : req.body.company.company_nm };
                option.multi = true;
                //incident 회사명 수정
                IncidentModel.update(condition, setQuery, option, function(err, tasks){                        
                    if(err){
                        res.render("http/500", {
                            cache : true,
                            err: err
                        });
                    }else{
                        callback(null);
                    }
                });
            }], function(){
                var condition = {};
                var setQuery = {};
                var option = {};
                condition.company_cd = req.body.company.company_cd;
                setQuery.$set = { "company_nm" : req.body.company.company_nm };
                option.multi = true;
                //사용자 회사명 수정
                UsermanageModel.update(condition, setQuery, option, function(err, tasks){                        
                    if(err){
                        res.render("http/500", {
                            cache : true,
                            err: err
                        });
                    }else{
                        res.redirect('/company/');
                    }
                });
            });
        }catch(e){

            logger.error("=================================");
            logger.error("company update error : ",e);
            logger.error("=================================");

        }finally{}
    },

    delete: (req, res, next) => {

        CompanyModel.findOneAndRemove({
            _id: req.params.id
            //,author: req.user._id
        }, function (err, company) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                if (!company) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                } else {
                    res.redirect('/company/',{cache : true});
                }
            }
        });
    },

    exceldownload: (req, res, next) => {

        CompanyModel.find(req.body.company, function (err, companyJsonData) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            } else {

                res.json(companyJsonData);
            }
        });
    },

    /**
     * 회사 정보 조회
     */
    getCompany: (req, res, next) => {
        try {

            logger.debug("==========================================company getCompany========================================");
            logger.debug("====================================================================================================");
            /*
                        try {
                            request({
                                //uri: "http://gw.isu.co.kr/CoviWeb/api/UserList.aspx?searchName="+encodeURIComponent(req.query.searchText),
                                uri: CONFIG.groupware.uri + "/CoviWeb/api/UserList.aspx?searchName=" + encodeURIComponent(req.query.searchText),
                                //uri: "http://gw.isu.co.kr/CoviWeb/api/UserInfo.aspx?email=hilee@isu.co.kr&password=nimda3",
                                headers: {
                                    'Content-type': 'application/json'
                                },
                                method: "GET",
                            }, function (err, response, usermanage) {

                                //logger.debug("=====================================");
                                //logger.debug("=====>userJSON group ", usermanage);
                                //logger.debug("=====================================");

                                Usermanage.find({
                                        employee_nm: {
                                            $regex: new RegExp(req.query.searchText, "i")
                                        },
                                        group_flag: "out"
                                    })
                                    .limit(10)
                                    .exec(function (err, usermanageData) {
                                        if (err) {
                                            return res.json({
                                                success: false,
                                                message: err
                                            });
                                        } else {
                                            if (usermanage != null) {
                                                usermanage = JSON.parse(usermanage);
                                            }
                                            res.json(mergeUser(usermanage, usermanageData));
                                        }
                                    }); //usermanage.find End
                            }); //request End
                        } catch (e) {
                            logger.error("===control usermanager.js userJSON : ", e);
                        }
            */

            CompanyModel.find({}, function (err, companyJsonData) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {

                        //logger.debug("==========================================CompanyModel.find({}========================================");
                        //logger.debug("companyJsonData : ",companyJsonData);
                        //logger.debug("====================================================================================================");

                        res.json(companyJsonData);
                    };

                })
                .sort({
                    group_flag: -1,
                    company_nm: 1
                });
        } catch (e) {
            logger.error("CompanyModel error : ", e);
        } finally {}
    },

    list: (req, res, next) => {
        var search = service.createSearch(req);

        var page = 1;
        var perPage = 15;

        if (req.query.page != null && req.query.page != '') page = Number(req.query.page);
        if (req.query.perPage != null && req.query.perPage != '') perPage = Number(req.query.perPage);


        async.waterfall([function (callback) {
            CompanyModel.find(search.findCompany, function (err, company) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        /*
                        logger.debug("==========================================getcompany=======================================");
                        logger.debug("company : ", company);
                        logger.debug("================================================================================================");
                        */

                        //callback(null, company);
                        callback(null);
                    }
                })
                /*
                .sort({
                    group_flag: -1,
                    company_nm: 1
                })
                .skip((page - 1) * perPage)
                .limit(perPage);
                */

        },
        function (callback) {
            CompanyModel.count(search.findCompany, function (err, totalCnt) {
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

            CompanyModel.find(search.findCompany, function (err, company) {
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
                    rtnData.company = company;
                    rtnData.totalCnt = totalCnt

                    //logger.debug("=============================================");
                    //logger.debug("rtnData.totalCnt : ", rtnData.totalCnt);
                    //logger.debug("rtnData : ", JSON.stringify(rtnData));
                    //logger.debug("=============================================");

                    res.json(rtnData);

                }
            })
                .sort({
                    group_flag: -1,
                    company_nm: 1
                })
                .skip((page - 1) * perPage)
                .limit(perPage);
        });
    /*], function (err, company) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            } else {
                
                logger.debug("==========================================getcompany=======================================");
                logger.debug("company list : ", JSON.stringify(company));
                logger.debug("==================================================+++===========================================");
                

                //res.send(company);
                //incident에 페이징 처리를 위한 전체 갯수전달
                var rtnData = {};
                rtnData.company = company;
                rtnData.totalCnt = totalCnt;

                //logger.debug("=============================================");
                //logger.debug("rtnData.totalCnt : ", rtnData.totalCnt);
                //logger.debug("rtnData : ", JSON.stringify(rtnData));
                //logger.debug("=============================================");

                res.json(rtnData);

            }
        });
        */
    },
    
    /**
     * 권한별 회사 정보 조회
     */
    getUFCompany: (req, res, next) => {
        try {

            //logger.debug("==========================================company getCompany========================================");
            //logger.debug("====================================================================================================");
            var condition ={};
            if(req.session.user_flag == "5"){
                condition.company_cd = req.session.company_cd;
            }
            CompanyModel.find(condition, function (err, companyJsonData) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {

                    //logger.debug("==========================================CompanyModel.find({}========================================");
                    //logger.debug("companyJsonData : ",companyJsonData);
                    //logger.debug("====================================================================================================");

                    res.json(companyJsonData);
                };

            })
            .sort({
                group_flag: -1,
                company_nm: 1
            });
            
        } catch (e) {
            logger.error("CompanyModel error : ", e);
        } finally {}
    },
};