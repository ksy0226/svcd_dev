'use strict';

const mongoose = require('mongoose');
const async = require('async');
const service = require('../services/question');
const logger = require('log4js').getLogger('app');

module.exports = {

    index: (req, res, next) => {

        logger.debug('req.params.searchType : ' + req.query.searchType);
        logger.debug('req.params.searchText : ' + req.query.searchText);

        var vistorCounter = null;
        var page = Math.max(1, req.params.page) > 1 ? parseInt(req.query.page) : 1;
        var limit = Math.max(1, req.params.limit) > 1 ? parseInt(req.query.limit) : 10;
        var search = service.createSearch(req);

        async.waterfall([function (callback) {
            if (search.findUser && !search.findQuestion.$or) return callback(null, null, 0);
            logger.debug("search : " + JSON.stringify(search));
            Question.count(search.findQuestion, function (err, count) {

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
            if (search.findUser && !search.findQuestion.$or) return callback(null, [], 0);
            logger.debug("search : " + JSON.stringify(search));
            Question.find(search.findQuestion)
                .populate("author")
                .sort('-createdAt')
                .skip(skip).limit(limit)
                .exec(function (err, question) {
                    if (err) callback(err);
                    callback(null, question, maxPage);
                });

        }], function (err, question, maxPage) {
            if (err) {
                logger.debug('Trace8', err);
                return res.json({
                    success: false,
                    message: err
                });
            }
            //logger.debug(question);
        
            res.render("question/index", {
                question: question,
                user: req.user,
                page: page,
                maxPage: maxPage,
                urlQuery: req._parsedUrl.query,
                search: search,
                counter: vistorCounter,
                questionMessage: req.flash("questionMessage")[0]
            });
        });
    },

    new: (req, res, next) => {
        res.render("question/new");
    },

    save: (req, res, next) => {
        async.waterfall([function (callback) {
            logger.debug('Trace777');
            Counter.findOne({
                name: "question"
            }, function (err, counter) {
                if (err) callback(err);
                if (counter) {
                    callback(null, counter);
                } else {
                    Counter.create({
                        name: "question",
                        totalCount: 0
                    }, function (err, counter) {
                        if (err) return res.json({
                            success: false,
                            message: err
                        });
                        callback(null, counter);
                    });
                }
            });
        }], function (callback, counter) {
            var newQuestion = req.body.question;
            logger.debug('body', req.body);
            logger.debug('newQuestion', newQuestion);
            logger.debug('etcInfo', req.body.etcInfo);
            //newQuestion.author = req.body.etcInfo.name;
            newQuestion.numId = counter.totalCount + 1;
            Question.create(req.body.question, function (err, question) {
                logger.debug('err', err, '\n');
                /*
                if (err) return res.json({
                    success: false,
                    message: err
                });
                */
                if (err) {
                    res.render("http/500", {
                        err: err
                    });
                }
                counter.totalCount++;
                counter.save();
                res.redirect('/question');
            });

            //res.redirect('/question');
        });
    },

    show: (req, res, next) => {
        logger.debug("Trace11");
        Question.findById(req.params.id).populate("author").exec(function (err, question) {
            if (err) return res.json({
                success: false,
                message: err
            });
            question.views++;
            //question.save();
            //logger.debug('aaa : %s',req._parsedUrl.query);
            res.render("question/show", {
                question: question,
                urlQuery: req._parsedUrl.query,
                user: req.user,
                search: service.createSearch(req)
            });
        });
    },
    edit: (req, res, next) => {
        logger.debug("Trace edit", req.params.id);
        Question.findById(req.params.id, function (err, question) {
            if (err) return res.json({
                success: false,
                message: err
            });
            //if (!req.user._id.equals(question.author)) return res.json({
            //    success: false,
            //    message: "Unauthrized Attempt"
            //});
            res.render("question/edit", {
                question: question,
                user: req.user
            });
        });
    },
    update: (req, res, next) => {
        logger.debug("Trace update", req.params.id);
        logger.debug(req.body);
        req.body.question.updatedAt = Date.now();
        Question.findOneAndUpdate({
            _id: req.params.id
            //,author: req.user._id
        }, req.body.question, function (err, question) {
            if (err) return res.json({
                success: false,
                message: err
            });
            if (!question) return res.json({
                success: false,
                message: "No data found to update"
            });
            res.redirect('/question/' + req.params.id + '/show');
        });
    },
    delete: (req, res, next) => {
        logger.debug("Trace delete", req.params.id);

        Question.findOneAndRemove({
            _id: req.params.id
            //,author: req.user._id
        }, function (err, question) {
            if (err) return res.json({
                success: false,
                message: err
            });
            if (!question) return res.json({
                success: false,
                message: "No data found to delete"
            });
            res.redirect('/question');
        });
    }
};
