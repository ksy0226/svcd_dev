'use strict';

const mongoose = require('mongoose');
const async = require('async');
const HigherProcessModel = require('../models/HigherProcess');
const OftenQnaModel = require('../models/OftenQna');
const service = require('../services/oftenqna');
const path = require('path');
const CONFIG = require('../../config/config.json');
const logger = require('log4js').getLogger('app');
const Iconv = require('iconv-lite');

module.exports = {

    index: (req, res, next) => {
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
                res.render("oftenqna/index", {
                    cache : true,
                    higherprocess: higherprocess
                });
            }
        });

        /*
        var search = service.createSearch(req);
        async.waterfall([function (callback) {
            HigherProcessModel.find(search.findOftenqna, function (err, higherprocess) {
                if (err) {
                    res.render("http/500", {
                        err: err
                    });
                }
                callback(null, higherprocess)
            });
        }], function (err, higherprocess) {
            if (err) {
                res.render("http/500", {
                    err: err
                });
            } else {
                res.render("oftenqna/index", {
                    higherprocess: higherprocess
                });
            }
        });
        */
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
        }], function (err, higher) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                res.render("oftenqna/new", {
                    cache : true,
                    higher: higher,
                    user_nm: req.session.user_nm,
                    sabun: req.session.sabun,
                });
            }
        });
    },

    save: (req, res, next) => {
        logger.debug('save start >>>>>>> ' + req);
        var newOftenqna = req.body.oftenqna;

        if (req.files) {
            newOftenqna.attach_file = req.files;
        }
        OftenQnaModel.create(newOftenqna, function (err, newOftenqna) {
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                res.redirect('/oftenqna');
            }
        });
    },

    edit: (req, res, next) => {
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
            OftenQnaModel.findById({ _id: req.params.id }, function (err, oftenqna) {
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
                            if (oftenqna.attach_file[i].mimetype.indexOf('image') > -1) {
                                oftenqna.attach_file[i].mimetype = 'image';
                            }
                        }
                    }

                    //조회수 증가하기
                    oftenqna.reading_cnt += 1;
                    oftenqna.save(function (err) {
                        if (err) {
                            res.render("http/500", {
                                cache : true,
                                err: err
                            });
                        } else {
                            logger.debug("===========================");
                            logger.debug("=oftenqna=>>>"+ oftenqna);
                            
                            res.render("oftenqna/edit", {
                                cache : true,
                                higher: higher,
                                oftenqna: oftenqna,
                                user: req.user
                            });
                        }
                    });
                }
            });
        });
    },

    update: (req, res, next) => {
        logger.debug("oftenQna controllers update start =====> " + JSON.stringify(req.body));
        var newOftenqna = req.body.oftenqna;
        logger.debug("==================> "+ newOftenqna.company_nm);

        if (req.files) {
            newOftenqna.attach_file = req.files;
        }
        OftenQnaModel.findOneAndUpdate({
            _id: req.params.id
        }, newOftenqna, function (err, newOftenqna) {
            logger.debug("newOftenqna ==============> " + newOftenqna);
            if (err) {
                res.render("http/500", {
                    cache : true,
                    err: err
                });
            } else {
                res.redirect('/oftenqna/');
                //res.render('/oftenqna/',{cache : true});
            }
        });
    },

    delete: (req, res, next) => {
        OftenQnaModel.findOneAndRemove({
            _id: req.params.id
        }, function (err, oftenqna) {
            if (err) return res.json({
                success: false,
                message: err
            });
            if (!oftenqna) return res.json({
                success: false,
                message: "No data found to delete"
            });
            res.redirect('/oftenqna');
        });
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

    //oftenqna 첨부파일 다운로드
    download: (req, res, next) => {
        var filepath = path.join(__dirname, '../../', CONFIG.fileUpload.directory, req.params.path1, req.params.path2);
        res.download(filepath, req.params.filename);
    },

    //ajax list 데이타 처리
    list: (req, res, next) => {
        var search = service.createSearch(req);

        //logger.debug("=====================> " + JSON.stringify(search));
        //console.log("=====================> " + search.order_by);

        try {
            async.waterfall([function (callback) {
                OftenQnaModel.find(search.findOftenqna, function (err, oftenqna) {
                    if (err) {
                        res.render("http/500", {
                            cache : true,
                            err: err
                        });
                    } else {
                        callback(null, oftenqna)
                    }
                }).sort("-" + search.order_by);
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
            logger.debug('oftenqna controllers error ====================> ', e)
        }
    },
    /**
     * 팝업공지에 따른 회사 조회 -> 
     */

    getCheckData :  (req, res, next) => {

        //logger.debug("Trace getCheckData  query: ", req.query.id);
        //logger.debug("Trace getCheckData  params: ", req.params.id);
        
        try {
            OftenQnaModel.findById({
                _id: req.params.id
            }, function (err, companyCheck) {
                //logger.debug("=== getCheckData 1=== ", req.params.id);
                //logger.debug("=== getCheckData 1=== ", companyCheck);
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {
                    res.send(companyCheck);
                }
            });
        } catch (e) {
            logger.debug('****************', e);
        }
        
    },
    
};
