'use strict';
var express = require('express');
var session = require('express-session');
var nodemailer = require('nodemailer');
var smtpPool = require('nodemailer-smtp-pool');
var MyProcess = require('../models/MyProcess');
var config = require('../../config/config.json');
var logger = require('log4js').getLogger('app');

var sender = '서비스데스크 관리자 <servicedesk@isu.co.kr>';
var coment = "";
coment += "<br><br>";
coment += "더 자세한 내용은 서비스 데스크 게시판에서 확인 하세요.<br>";
coment += "서비스 데스크 ( https://helpdesk.isusystem.co.kr )<br>";
coment += "<br>";
coment += "※ 이 메일은 발신 전용입니다. 회신은 처리되지 않습니다.";

module.exports = {

    //접수메일
    receiveSend: (req, req2, res, next) => {
        var receiver = req.request_nm + " <" + req.request_id + ">";
        var mailTitle = "[서비스데스크 접수 처리] " + req.title;
        var html = "";
        html += "고객사명 : " + req.request_company_nm + "<br>";
        html += "요청자명 : " + req.request_nm + "<br>";
        html += "완료요청일자 : " + req.request_complete_date + "<br>";
        html += "< 문의내용 ><br>";
        html += req.content + "<br>";
        html += "<br><hr><br>";
        html += "접수일자 : " + req2.receipt_date + "<br>";
        html += "담당자명 : " + req2.manager_nm + "<br>";
        html += "완료예정일자 : " + req2.complete_reserve_date + "<br>";
        html += "< 접수내용 ><br>";
        html += req2.receipt_content + "<br>";
        html += coment;

        var mailOptions = {
            from: sender,
            to: receiver,
            subject: mailTitle,
            html: html
        };

        var transporter = nodemailer.createTransport(smtpPool({
            service: config.mailer.service,
            host: config.mailer.host,
            port: config.mailer.port,
            auth: {
                user: config.mailer.user,
                pass: config.mailer.password
            },
            tls: {
                rejectUnauthorize: false
            },
            maxConnections: 5,
            maxMessages: 10
        }));

        transporter.sendMail(mailOptions, function (err, res) {
            if (err) {
                logger.debug('Nodemailer receiveSend Failes >>>>>>>>>> ' + err)
            }
            transporter.close();
        });
    },

    //완료메일
    finishSend: (req, req2, res, next) => {
        var receiver = req.request_nm + " <" + req.request_id + ">";
        var mailTitle = "[서비스데스크 완료 처리] " + req.title;
        var html = "";
        html += "고객사명 : " + req.request_company_nm + "<br>";
        html += "요청자명 : " + req.request_nm + "<br>";
        html += "완료요청일자 : " + req.request_complete_date + "<br>";
        html += "< 문의내용 ><br>";
        html += req.content + "<br>";
        html += "<br><hr><br>";
        html += "완료일자 : " + req2.complete_date + "<br>";
        html += "담당자명 : " + req.manager_nm + "<br>";
        html += "< 처리내용 ><br>";
        html += req2.complete_content + "<br>";
        html += coment;

        var mailOptions = {
            from: sender,
            to: receiver,
            subject: mailTitle,
            html: html
        };

        var transporter = nodemailer.createTransport(smtpPool({
            service: config.mailer.service,
            host: config.mailer.host,
            port: config.mailer.port,
            auth: {
                user: config.mailer.user,
                pass: config.mailer.password
            },
            tls: {
                rejectUnauthorize: false
            },
            maxConnections: 5,
            maxMessages: 10
        }));

        transporter.sendMail(mailOptions, function (err, res) {
            if (err) {
                logger.debug('Nodemailer finishSend Failes >>>>>>>>>> ' + err)
            }
            transporter.close();
        });
    },

    //평가메일
    evaluationSend: (req, req2, res, next) => {
        var evaluationValue = req2.valuation;
        var evaluationValueNM = "";

        if (evaluationValue == '1') {
            evaluationValueNM = "매우 불만족"
        } else if (evaluationValue == '2') {
            evaluationValueNM = "불만족"
        } else if (evaluationValue == '3') {
            evaluationValueNM = "보통"
        } else if (evaluationValue == '4') {
            evaluationValueNM = "만족"
        } else if (evaluationValue == '5') {
            evaluationValueNM = "매우 만족"
        }

        var receiver = req.manager_nm + " <" + req.manager_email + ">";
        var mailTitle = "[서비스데스크 평가 완료] " + req.title;
        var html = "";
        html += "고객사명 : " + req.request_company_nm + "<br>";
        html += "요청자명 : " + req.request_nm + "<br>";
        html += "평가점수 : " + evaluationValueNM + " (" + evaluationValue + " 점)" + "<br>";
        html += "< 문의내용 ><br>";
        html += req.content + "<br>";
        html += "<br><hr>";
        html += coment;

        var mailOptions = {
            from: sender,
            to: receiver,
            subject: mailTitle,
            html: html
        };

        var transporter = nodemailer.createTransport(smtpPool({
            service: config.mailer.service,
            host: config.mailer.host,
            port: config.mailer.port,
            auth: {
                user: config.mailer.user,
                pass: config.mailer.password
            },
            tls: {
                rejectUnauthorize: false
            },
            maxConnections: 5,
            maxMessages: 10
        }));

        transporter.sendMail(mailOptions, function (err, res) {
            if (err) {
                logger.debug('Nodemailer evaluationSend Failes >>>>>>>>>> ' + err)
            }
            transporter.close();
        });
    },

    //문의 등록시 메일 알리미
    mailAlimiSend: (req, res, next) => {
        //logger.debug("=============================================KSY1");
        //logger.debug("util/nodemailer/mailAlimiSend, req : ", req);
        //logger.debug("=============================================")

        try {
            //>>>>> 상위업무에 매핑되는 사원찾기
            var condition = {};
            condition.higher_cd = req.higher_cd;

            var aggregatorOpts = [{
                $match: condition
            }, {
                $group: { //그룹
                    _id: {
                        email: "$email"
                    }
                }
            }, {
                $lookup: {
                    from: "usermanages", // join 할 collection명
                    localField: "_id.email", // 기본 키($group에서 얻은 값)
                    foreignField: "email", // 외래 키(usermanagers collection에 값) 
                    as: "manager" // 결과를 배출할 alias ( 필드명 )
                }
            }, {
                $project: {
                    "manager.email": 1,
                    "manager.email_send_yn": 1,
                    "manager.using_yn" : 1
                }
            }]

            //logger.debug("=============================================KSY2");
            //logger.debug("util/nodemailer/mailAlimiSend aggregate!!! aggregatorOpts  ", JSON.stringify(aggregatorOpts));
            //logger.debug("=============================================");

            MyProcess.aggregate(aggregatorOpts).exec(function (err, targetUser) {

                if (err) {

                    logger.error("=============================================");
                    logger.error("util/nodemailer/mailAlimiSend aggregate!!! err  ", err);
                    logger.error("=============================================");

                } else {

                    if (targetUser != null) {
                        //logger.debug("=============================================KSY3");
                        //logger.debug("util/nodemailer/mailAlimiSend aggregate!!! targetUser >>> ", JSON.stringify(targetUser));
                        //logger.debug("=============================================");

                        for (var i = 0; i < targetUser.length; i++) {

                            //logger.debug("=============================================KSY4");
                            //logger.debug("util/nodemailer/mailAlimiSend aggregate!!! aggregatorOpts >>> ", JSON.stringify(aggregatorOpts));
                            //logger.debug("util/nodemailer/mailAlimiSend aggregate!!! targetUser[i].manager >>> ", targetUser[i].manager.length);
                            //logger.debug("=============================================");

                            if (targetUser[i].manager.length > 0) {

                                logger.debug("=============================================KSY5");
                                logger.debug("util/nodemailer/mailAlimiSend aggregate!!! targetUser[i].manager >>> ", targetUser[i].manager);
                                logger.debug("=============================================");

                                if (targetUser[i].manager[0].using_yn == "Y" && targetUser[i].manager[0].email_send_yn == "Y") {

                                    var receiver = targetUser[i].manager[0].email;
                                    //var receiver = 'ksy0226@isu.co.kr';
                                    var mailTitle = "[서비스데스크 등록 알림] 상위 업무 : " + req.higher_nm;
                                    var html = "";
                                    html += "고객사명 : " + req.request_company_nm + "<br>";
                                    html += "요청자명 : " + req.request_nm + "<br>";
                                    html += "완료요청일자 : " + req.request_complete_date + "<br>";
                                    html += "< 문의내용 ><br>";
                                    html += req.content + "<br>";
                                    html += "<br><hr>";
                                    html += coment;

                                    var mailOptions = {
                                        from: sender,
                                        to: receiver,
                                        subject: mailTitle,
                                        html: html
                                    };

                                    var transporter = nodemailer.createTransport(smtpPool({
                                        service: config.mailer.service,
                                        host: config.mailer.host,
                                        port: config.mailer.port,
                                        auth: {
                                            user: config.mailer.user,
                                            pass: config.mailer.password
                                        },
                                        tls: {
                                            rejectUnauthorize: false
                                        },
                                        maxConnections: 5,
                                        maxMessages: 10
                                    }));

                                    transporter.sendMail(mailOptions, function (err, res) {
                                        if (err) {
                                            logger.debug('Nodemailer evaluationSend Failes >>>>>>>>>> ' + err)
                                        }
                                        transporter.close();
                                    });

                                } else {

                                    //logger.debug("=============================================");
                                    //logger.debug("util/nodemailer/mailAlimiSend aggregate!!! targetUser[i]  ", JSON.stringify(targetUser[i]));
                                    //logger.debug("=============================================");

                                }
                            }
                        }
                    }
                }
            });
            //<<<<< 상위업무에 매핑되는 사원찾기
        } catch (e) {

            logger.error("=============================================");
            logger.error("util/nodemailer/mailAlimiSend error : ", e);
            logger.error("=============================================")

        } finally {

        }

    },
}