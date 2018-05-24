'use strict';

const mongoose = require('mongoose');
const async = require('async');
const CompanyModel = require('../models/Company');
const Usermanage = require('../models/Usermanage');
const service = require('../services/usermanage');
const CONFIG = require('../../config/config.json');
const logger = require('log4js').getLogger('app');
const Iconv = require('iconv-lite');
const request = require("request");

module.exports = {

    index: (req, res, next) => {
        async.waterfall([function (callback) {
            Usermanage.find({}, function (err, usermanage) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }
                callback(null, usermanage)
            }).sort({
                group_flag: -1,
                company_nm: 1,
                employee_nm: 1
            });
        }, function (usermanage, callback) {
            CompanyModel.find({}, function (err, company) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }

                logger.debug("======================================");
                logger.debug("usermanage index");
                logger.debug("======================================");

                callback(null, usermanage, company)
            }).sort({
                group_flag: -1,
                company_nm: 1
            });
        }], function (err, usermanage, company) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                res.render("usermanage/index", {
                    cache : true,
                    company: company,
                    usermanage: usermanage
                });
            }
        });

        /*
       //logger.debug('req.params.searchType : ' + req.query.searchType);
       //logger.debug('req.params.searchText : ' + req.query.searchText);

       var vistorCounter = null;
       var page = Math.max(1, req.params.page) > 1 ? parseInt(req.query.page) : 1;
       var limit = Math.max(1, req.params.limit) > 1 ? parseInt(req.query.limit) : 50;
       var search = service.createSearch(req);

       async.waterfall([function (callback) {
           if (search.findUser && !search.findUsermanage.$or) return callback(null, null, 0);
           //logger.debug("search : " + JSON.stringify(search));
           Usermanage.count(search.findUsermanage, function (err, count) {
               if (err) {
                   return res.json({
                       success: false,
                       message: err
                   });
               }
               var skip = (page - 1) * limit;
               var maxPage = Math.ceil(count / limit);
               callback(null, skip, maxPage);
           });
       }, function (skip, maxPage, callback) {
           if (search.findUser && !search.findUsermanage.$or) return callback(null, [], 0);
           //logger.debug("search : " + JSON.stringify(search));
           Usermanage.find(search.findUsermanage)
               .populate("_id")
               .sort('-createdAt')
               .skip(skip).limit(limit)
               .exec(function (err, usermanage) {
                   if (err) callback(err);
                   callback(null, usermanage, maxPage);
               });

       }], function (err, usermanage, maxPage) {
           if (err) {
               return res.json({
                   success: false,
                   message: err
               });
           }
           res.render("usermanage/index", {
               usermanage: usermanage,
               user: req.user,
               page: page,
               maxPage: maxPage,
               urlQuery: req._parsedUrl.query,
               search: search,
               counter: vistorCounter,
               usermanageMessage: req.flash("usermanageMessage")[0]
           });
       });
       */
    },

    new: (req, res, next) => {
        async.waterfall([function (callback) {
            CompanyModel.find({}, function (err, company) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }
                callback(null, company)
            });
        }], function (err, company) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            }
            res.render("usermanage/new", {
                cache : true,
                company: company
            });
        });
    },

    save: (req, res, next) => {
        //logger.debug('Usermanage save debug Start >>> ', req.body.usermanage);
        var usermanage = req.body.usermanage;

        async.waterfall([function (callback) {
            Usermanage.count({ 'email': usermanage.email }, function (err, userCnt) {
                if (err) {

                    logger.debug("=============================================");
                    logger.debug("login.js new usermanage err : ", err);
                    logger.debug("=============================================");

                    return res.json({
                        success: false,
                        message: err
                    });
                } else {

                    //logger.debug("=============================================");
                    //logger.debug("login new usermanage userCnt : ", userCnt);
                    //logger.debug("=============================================");

                    callback(null, userCnt)
                }
            })
        }], function (err, userCnt) {
            var rtnData = {};

            if (userCnt > 0) {
                rtnData.message = "중복된 계정이 존재합니다.";
                res.send(rtnData.message);
            } else {
                Usermanage.create(req.body.usermanage, function (err, usermanage) {
                    if (err) {
                        res.render("http/500", {
                            cache : true,
                            err: err
                        });
                    } else {
                        res.redirect('/usermanage');
                    }
                });
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
            });
        }], function (err, company) {
            Usermanage.findById(req.params.id, function (err, usermanage) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                } else {
                    res.render("usermanage/edit", {
                        cache : true,
                        usermanage: usermanage,
                        user: req.user,
                        company: company
                    });
                }
            });
        });
    },

    update: (req, res, next) => {
        req.body.usermanage.updatedAt = Date.now();
        Usermanage.findOneAndUpdate({
            _id: req.params.id
        }, req.body.usermanage, function (err, usermanage) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            }
            if (!usermanage) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            }
            res.redirect('/usermanage/');
        });
    },

    delete: (req, res, next) => {
        Usermanage.findOneAndRemove({
            _id: req.params.id
        }, function (err, usermanage) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            }
            if (!usermanage) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            }
            res.redirect('/usermanage');
        });
    },

    myPage: (req, res, next) => {
        async.waterfall([function (callback) {
            CompanyModel.find({}, function (err, company) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }
                callback(null, company)
            });
        }], function (err, company) {
            Usermanage.findOne({ email: req.session.email }, function (err, usermanage) {
                /*
                logger.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                logger.debug("usermanage : ", usermanage);
                logger.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                */

                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                } else {
                    res.render("myPage/edit", {
                        cache : true,
                        usermanage: usermanage,
                        user: req.user,
                        company: company
                    });
                }
            });
        });
    },

    myPageUpdate: (req, res, next) => {
        req.body.usermanage.updatedAt = Date.now();
        Usermanage.findOneAndUpdate({
            email: req.session.email
        }, req.body.usermanage, function (err, usermanage) {
            /*
            logger.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            logger.debug("usermanage : ", usermanage);
            logger.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            */

            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            }
            if (!usermanage) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            }
            res.redirect('/usermanage/myPage');
        });
    },

    userInfo: (req, res, next) => {
        Usermanage.find({
            employee_nm: {
                $regex: new RegExp(req.query.request_info, "i")
            }
        }, function (err, usermanageData) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            }

            //logger.debug(usermanageData);
            //res.json(companyJsonData);
            //res.send({usermanageData : usermanageData});

            //res.render("usermanage/index", {
            //usermanageData : usermanageData
            //});
            res.json(usermanageData);
        });
    },

    //ajax list 데이타 처리
    list: (req, res, next) => {
        var search = service.createSearch(req);

        //logger.debug("=====================> " + JSON.stringify(search));

        try {
            async.waterfall([function (callback) {
                Usermanage.find(search.findUsermanage, function (err, usermanage) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        callback(null, usermanage)
                    }
                }).sort({
                    group_flag: -1,
                    company_nm: 1
                });
            }], function (err, usermanage) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {
                    res.send(usermanage);
                }
            });
        } catch (e) {
            logger.debug('usermanage controllers error ====================> ', e)
        }
    },

    userJSON: (req, res, next) => {

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
                    }
                    , group_flag: "out"
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
    },//userJSON End
};


function mergeUser(trg1, trg2) {
    var rtnJSON = [];
    try {
        if (trg1 != null) {
            for (var i = 0; i < trg1.length; i++) {
                rtnJSON.push(trg1[i]);
            }
        }
        if (trg2 != null) {
            for (var i = 0; i < trg2.length; i++) {
                rtnJSON.push(trg2[i]);
            }
        }
        return rtnJSON;
    } catch (e) {
        logger.error("control useremanage mergeUser : ", e);
    }
}
