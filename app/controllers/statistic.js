const mongoose = require('mongoose');
const async = require('async');
const IncidentModel = require('../models/Incident');
var MyProcess = require('../models/MyProcess');
const ProcessGubunModel = require('../models/ProcessGubun');
var service = require('../services/statistic');
const logger = require('log4js').getLogger('app');

module.exports = {
    /**
     * 회사별 상위업무 통계 화면
     */
    com_higher: (req, res, next) => {
        res.render("statistic/com_higher",{cache : true});
    },

    /**
     * 회사별 상위업무 통계 데이타 조회
     */
    getComHigher: (req, res, next) => {

        var svc = service.com_higher(req);

        IncidentModel.aggregate(svc.aggregatorOpts)
            .exec(function (err, incident) {

                if (err) {

                    //logger.debug("==================================================");
                    //logger.debug(" IncidentModel.aggregate error ", err);
                    //logger.debug("==================================================");

                    return res.json({
                        success: false,
                        message: err
                    });

                } else {

                    incident.forEach(function (data, idx, incident) {

                        //logger.debug("==================================================");
                        //logger.debug("data ", JSON.stringify(data));
                        //logger.debug("data.grp.length ", data.grp.length);
                        //logger.debug("==================================================");


                        var totalCnt = 0; //전체 개수
                        var stCnt1 = 0; //신청중 개수
                        var stCnt2 = 0; //처리중 개수
                        var stCnt3 = 0; //미평가
                        var stCnt4 = 0; //완료
                        var stCnt5 = 0; //협의필요  개수
                        var stCnt3_4 = 0; //미평가+완료 개수


                        for (var i = 0; i < data.grp.length; i++) {
                            //전체 개수
                            totalCnt = totalCnt + data.grp[i].count;

                            //신청중 개수
                            if (data.grp[i].status_cd == '1') {
                                stCnt1 = stCnt1 + data.grp[i].count;
                            }

                            //처리중 개수
                            if (data.grp[i].status_cd == '2') {
                                stCnt2 = stCnt2 + data.grp[i].count;
                            }

                            //미평가 개수
                            if (data.grp[i].status_cd == '3') {
                                stCnt3 = stCnt3 + data.grp[i].count;
                            }

                            //완료 개수
                            if (data.grp[i].status_cd == '4') {
                                stCnt4 = stCnt4 + data.grp[i].count;
                            }

                            //협의필요 
                            if (data.grp[i].status_cd == '5') {
                                stCnt5 = stCnt5 + data.grp[i].count;
                            }

                            //완료 또는 미평가
                            if (data.grp[i].status_cd == '3' || data.grp[i].status_cd == '4') {
                                stCnt3_4 = stCnt3_4 + data.grp[i].count;
                            }

                        }

                        data.totalCnt = totalCnt;
                        data.stCnt1 = stCnt1;
                        data.stCnt2 = stCnt2;
                        data.stCnt3 = stCnt3;
                        data.stCnt4 = stCnt4;
                        data.stCnt5 = stCnt5;
                        data.stCnt3_4 = stCnt3_4;
                        data.solRatio = ((stCnt3_4 * 100) / totalCnt).toFixed(2);

                        //평점
                        if (data.valuationSum > 0) {
                            data.valAvg = (data.valuationSum / stCnt4).toFixed(2);
                        } else {
                            data.valAvg = 0;
                        }

                        //logger.debug("==================================================");
                        //logger.debug("data.totalCnt : ", data.totalCnt);
                        //logger.debug("data.stCnt1 : ", data.stCnt1);
                        //logger.debug("data.stCnt2 : ", data.stCnt2);
                        //logger.debug("data.stCnt3 : ", data.stCnt3);
                        //logger.debug("data.stCnt4 : ", data.stCnt4);
                        //logger.debug("data.solRatio : ", data.solRatio);
                        //logger.debug("data.valuationSum : ", data.valuationSum);
                        //logger.debug("data.valAvg : ", data.valAvg);
                        //logger.debug("==================================================");

                    });
                    //logger.debug("=====>>>>" + JSON.stringify(incident));
                    res.json(incident);
                }
            })
    },

    process_gubun: (req, res, next) => {
        res.render("statistic/process_gubun",{cache : true});
    },

    getProcessGubun: (req, res, next) => {
        
        //var svc = service.com_higher(req);
        var svc = service.process_gubun(req);

        IncidentModel.aggregate(svc.aggregatorOpts)
            .exec(function (err, incident) {

            if (err) {

                //logger.debug("==================================================");
                //logger.debug(" IncidentModel.aggregate error ", err);
                //logger.debug("==================================================");

                return res.json({
                    success: false,
                    message: err
                });

            } else {

                incident.forEach(function (data, idx, incident) {

                    //logger.debug("==================================================");
                    //logger.debug("data ", JSON.stringify(data));
                    //logger.debug("data.grp.length ", data.grp.length);
                    //logger.debug("==================================================");


                    var totalCnt = 0; //전체 개수
                    var stCnt1 = 0; //신청중 개수
                    var stCnt2 = 0; //처리중 개수
                    var stCnt3 = 0; //미평가
                    var stCnt4 = 0; //완료
                    var stCnt5 = 0; //협의필요  개수
                    var stCnt3_4 = 0; //미평가+완료 개수


                    for (var i = 0; i < data.grp.length; i++) {
                        //전체 개수
                        totalCnt = totalCnt + data.grp[i].count;
                            
                        //신청중 개수
                        if (data.grp[i].status_cd == '1') {
                            stCnt1 = stCnt1 + data.grp[i].count;
                        }

                        //처리중 개수
                        if (data.grp[i].status_cd == '2') {
                            stCnt2 = stCnt2 + data.grp[i].count;
                        }

                        //미평가 개수
                        if (data.grp[i].status_cd == '3') {
                            stCnt3 = stCnt3 + data.grp[i].count;
                        }

                        //완료 개수
                        if (data.grp[i].status_cd == '4') {
                            stCnt4 = stCnt4 + data.grp[i].count;
                        }

                        //협의필요 
                        if (data.grp[i].status_cd == '5') {
                            stCnt5 = stCnt5 + data.grp[i].count;
                        }

                        //완료 또는 미평가
                        if (data.grp[i].status_cd == '3' || data.grp[i].status_cd == '4') {
                            stCnt3_4 = stCnt3_4 + data.grp[i].count;
                        }

                    }

                    data.totalCnt = totalCnt;
                    data.stCnt1 = stCnt1;
                    data.stCnt2 = stCnt2;
                    data.stCnt3 = stCnt3;
                    data.stCnt4 = stCnt4;
                    data.stCnt5 = stCnt5;
                    data.stCnt3_4 = stCnt3_4;
                    data.solRatio = ((stCnt3_4 * 100) / totalCnt).toFixed(2);

                    //평점
                    if (data.valuationSum > 0) {
                        data.valAvg = (data.valuationSum / stCnt4).toFixed(2);
                    } else {
                        data.valAvg = 0;
                    }

                    logger.debug("==================================================");
                    logger.debug("data.totalCnt : ", data.totalCnt);
                    logger.debug("data.stCnt1 : ", data.stCnt1);
                    logger.debug("data.stCnt2 : ", data.stCnt2);
                    logger.debug("data.stCnt3 : ", data.stCnt3);
                    logger.debug("data.stCnt4 : ", data.stCnt4);
                    logger.debug("data.solRatio : ", data.solRatio);
                    logger.debug("data.valuationSum : ", data.valuationSum);
                    logger.debug("data.valAvg : ", data.valAvg);
                    logger.debug("==================================================");

                });
                //logger.debug("=====>>>>" + JSON.stringify(incident));
                res.json(incident);
            }
        })
    },

    /**
     * 상위별 하위업무 통계 화면
     */
    high_lower: (req, res, next) => {
        res.render("statistic/high_lower",{cache : true});
    },

    /**
     * 상위별 하위업무 통계 데이타 조회
     */
    getHighLower: (req, res, next) => {
        
        logger.debug("==================================================");
        logger.debug(" IncidentModel getHighLower : ");
        logger.debug("==================================================");


        var svc = service.high_lower(req);

        IncidentModel.aggregate(svc.aggregatorOpts)
            .exec(function (err, incident) {

                if (err) {

                    logger.debug("==================================================");
                    logger.debug(" IncidentModel.aggregate error ", err);
                    logger.debug("==================================================");

                    return res.json({
                        success: false,
                        message: err
                    });

                } else {

                    incident.forEach(function (data, idx, incident) {

                        logger.debug("==================================================");
                        logger.debug("data ", JSON.stringify(data));
                        logger.debug("data.grp.length ", data.grp.length);
                        logger.debug("==================================================");


                        var totalCnt = 0; //전체 개수
                        var stCnt1 = 0; //신청중 개수
                        var stCnt2 = 0; //처리중 개수
                        var stCnt3 = 0; //미평가
                        var stCnt4 = 0; //완료
                        var stCnt5 = 0; //협의필요  개수
                        var stCnt3_4 = 0; //미평가+완료 개수


                        for (var i = 0; i < data.grp.length; i++) {
                            //전체 개수
                            totalCnt = totalCnt + data.grp[i].count;

                            //신청중 개수

                            if (data.grp[i].status_cd == '1') {
                                stCnt1 = stCnt1 + data.grp[i].count;
                            }

                            //처리중 개수
                            if (data.grp[i].status_cd == '2') {
                                stCnt2 = stCnt2 + data.grp[i].count;
                            }

                            //미평가 개수
                            if (data.grp[i].status_cd == '3') {
                                stCnt3 = stCnt3 + data.grp[i].count;
                            }

                            //완료 개수
                            if (data.grp[i].status_cd == '4') {
                                stCnt4 = stCnt4 + data.grp[i].count;
                            }

                            //협의필요 
                            if (data.grp[i].status_cd == '5') {
                                stCnt5 = stCnt5 + data.grp[i].count;
                            }

                            //완료 또는 미평가
                            if (data.grp[i].status_cd == '3' || data.grp[i].status_cd == '4') {
                                stCnt3_4 = stCnt3_4 + data.grp[i].count;
                            }
                        }

                        data.totalCnt = totalCnt;
                        data.stCnt1 = stCnt1;
                        data.stCnt2 = stCnt2;
                        data.stCnt3 = stCnt3;
                        data.stCnt4 = stCnt4;
                        data.stCnt5 = stCnt5;
                        data.stCnt3_4 = stCnt3_4;
                        data.solRatio = ((stCnt3_4 * 100) / totalCnt).toFixed(2);

                        //평점
                        if (data.valuationSum > 0) {
                            data.valAvg = (data.valuationSum / stCnt4).toFixed(2);
                        } else {
                            data.valAvg = 0;
                        }

                        logger.debug("==================================================");
                        logger.debug("data.totalCnt : ", data.totalCnt);
                        logger.debug("data.stCnt1 : ", data.stCnt1);
                        logger.debug("data.stCnt2 : ", data.stCnt2);
                        logger.debug("data.stCnt3 : ", data.stCnt3);
                        logger.debug("data.stCnt4 : ", data.stCnt4);
                        logger.debug("data.solRatio : ", data.solRatio);
                        logger.debug("data.valuationSum : ", data.valuationSum);
                        logger.debug("data.valAvg : ", data.valAvg);
                        logger.debug("==================================================");

                    });

                    res.json(incident);
                }
            })
    },

    /**
     * 일반 사용자 메인 카운트 로드 (user_flag='9')
     */
    userCntLoad: (req, res, next) => {
        var today = new Date();
        var thisYear = today.getFullYear();

        var aggregatorOpts = [{
            $match: { //조건
                //manager_company_cd: req.session.company_cd  //각 사별 관리담당자는?
                request_id: req.session.email,     //req.session.sabun 넣을 예정
                $or: [{
                    status_cd: "1"
                }, {
                    status_cd: "2"
                }, {
                    status_cd: "3"
                }, {
                    status_cd: "4"
                }]
                ,
                register_yyyy: thisYear.toString()

            }
        }, {
            $group: { //그룹칼럼
                _id: {
                    status_cd: "$status_cd"
                },
                count: {
                    $sum: 1
                }
            }
        }, {
            $sort: {
                status_cd: -1
            }
        }]

        IncidentModel.aggregate(aggregatorOpts).exec(function (err, incident) {
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            }

            //logger.debug("==================================================");
            //logger.debug("incident : ", incident);
            //logger.debug("==================================================");

            res.json(incident);
        });
    },
    /**
     * 메인 상단 카운트 로드
     * 1 : 전체관리자
     * 3 : 업무관리자
     * 4 : 업무담당자
     * 5 : 고객사관리자
     * 9 : 일반사용자
     */

    cntload: (req, res, next) => {

        try {
            async.waterfall([function (callback) {


                var today = new Date();
                var thisYear = today.getFullYear();

                //logger.debug("==================================================");
                //logger.debug("req.session.user_flag : ", req.session.user_flag);
                //logger.debug("==================================================");

                var condition = {};
                var OrQueries = [];
                var AndQueries = [];

                if (req.session.user_flag == 3 || req.session.user_flag == 4) {

                    //나의업무지정 상위업무 처리 위한 조건
                    var condition2 = {};
                    condition2.email = req.session.email;
                    MyProcess.find(condition2).distinct('higher_cd').exec(function (err, myHigherProcess) {

                        //logger.debug("==================================================");
                        //logger.debug("myHigherProcess : ", myHigherProcess);
                        //logger.debug("==================================================");
                        if (condition.$and == null) {

                            condition.$and = [{
                                "higher_cd": {
                                    "$in": myHigherProcess
                                }
                            }];

                            //logger.debug("=============================================");
                            //logger.debug("condition.$and is null : ", JSON.stringify(condition));
                            //logger.debug("=============================================");

                        } else {

                            condition.$and.push({
                                "higher_cd": {
                                    "$in": myHigherProcess
                                }
                            });

                            //logger.debug("=============================================");
                            //logger.debug("condition.$and is not null : ", JSON.stringify(condition));
                            //logger.debug("=============================================");
                        }

                        if (condition.$and == null) {

                            condition.$and = [{
                                "status_cd": {
                                    "$in": ["1", "2", "3", "4"]
                                }
                            }];

                            //logger.debug("=============================================");
                            //logger.debug("condition.$and is null : ", JSON.stringify(condition));
                            //logger.debug("=============================================");

                        } else {

                            condition.$and.push({
                                "status_cd": {
                                    "$in": ["1", "2", "3", "4"]
                                }
                            });

                            //logger.debug("=============================================");
                            //logger.debug("condition.$and is not null : ", JSON.stringify(condition));
                            //logger.debug("=============================================");

                        }


                        if (condition.$and == null) {

                            condition.$and = [{
                                "register_yyyy": thisYear.toString()
                            }];
                            //logger.debug("=============================================");
                            //logger.debug("condition.$and is null : ", JSON.stringify(condition));
                            //logger.debug("=============================================");

                        } else {

                            condition.$and.push({
                                "register_yyyy": thisYear.toString()
                            });

                            //logger.debug("=============================================");
                            //logger.debug("condition.$and is not null : ", JSON.stringify(condition));
                            //logger.debug("=============================================");

                        }

                        //condition.register_date = { $gte: startDate, $lte: endDate } //30일 기간으로 수정
                        //condition.register_yyyy = thisYear.toString();

                        //logger.debug("=============================================");
                        //logger.debug("thisYear : ", thisYear.toString());
                        //logger.debug("=============================================");

                        //logger.debug("=============================================");
                        //logger.debug("condition : ", condition);
                        //logger.debug("JSON.stringify(condition) : ", JSON.stringify(condition));
                        //logger.debug("=============================================");

                        callback(condition);



                    });

                } else {


                    if (req.session.user_flag == 1) {        //전체관리자

                        //logger.debug("==================================================");
                        //logger.debug("req.session.user_flag : ", req.session.user_flag);
                        //logger.debug("==================================================");

                    //} else if (req.session.user_flag == 3) {  //업무관리자

                        //logger.debug("==================================================");
                        //logger.debug("req.session.user_flag : ", req.session.user_flag);
                        //logger.debug("==================================================");

                        //condition.manager_dept_cd = req.session.dept_cd;

                        //logger.debug("==================================================");
                        //logger.debug("condition.manager_dept_cd : ", condition.manager_dept_cd);
                        //logger.debug("==================================================");

                    } else if (req.session.user_flag == 5) {  //고객사관리자

                        //logger.debug("==================================================");
                        //logger.debug("req.session.user_flag : ", req.session.user_flag);
                        //logger.debug("==================================================");

                        condition.request_company_cd = req.session.company_cd;

                        //logger.debug("==================================================");
                        //logger.debug("condition.request_company_cd : ", condition.request_company_cd);
                        //logger.debug("==================================================");

                    } else if (req.session.user_flag == 9) {  //일반사용자

                        //logger.debug("==================================================");
                        //logger.debug("req.session.user_flag : ", req.session.user_flag);
                        //logger.debug("==================================================");

                        condition.request_id = req.session.email;

                        //logger.debug("==================================================");
                        //logger.debug("condition.request_id : ", condition.request_id);
                        //logger.debug("==================================================");

                    }

                    if (condition.$and == null) {

                        condition.$and = [{
                            "status_cd": {
                                "$in": ["1", "2", "3", "4"]
                            }
                        }];

                        //logger.debug("=============================================");
                        //logger.debug("condition.$and is null : ", JSON.stringify(condition));
                        //logger.debug("=============================================");

                    } else {

                        condition.$and.push({
                            "status_cd": {
                                "$in": ["1", "2", "3", "4"]
                            }
                        });

                        //logger.debug("=============================================");
                        //logger.debug("condition.$and is not null : ", JSON.stringify(condition));
                        //logger.debug("=============================================");

                    }


                    if (condition.$and == null) {

                        condition.$and = [{
                            "register_yyyy": thisYear.toString()
                        }];
                        //logger.debug("=============================================");
                        //logger.debug("condition.$and is null : ", JSON.stringify(condition));
                        //logger.debug("=============================================");

                    } else {

                        condition.$and.push({
                            "register_yyyy": thisYear.toString()
                        });

                        //logger.debug("=============================================");
                        //logger.debug("condition.$and is not null : ", JSON.stringify(condition));
                        //logger.debug("=============================================");

                    }

                    //condition.register_date = { $gte: startDate, $lte: endDate } //30일 기간으로 수정
                    //condition.register_yyyy = thisYear.toString();

                    //logger.debug("=============================================");
                    //logger.debug("thisYear : ", thisYear.toString());
                    //logger.debug("=============================================");

                    //var cdt = {"$and":[{"status_cd":{"$in":["1","2","3","4"]}},{"register_yyyy":"2018"},{"higher_cd":{"$in":["H001"]}}]};
                    //var cdt = {"$and":[{"status_cd":{"$in":["1","2","3","4"]}},{"register_yyyy":"2018"},{"higher_cd":{"$in":["H001"]}}]};
                    //var cdt = {"$and":[{"status_cd":{"$in":["1","2","3","4"]}},{"register_yyyy":"2018"},{"higher_cd":{"$in":["H001"]}}]};

                    //logger.debug("=============================================");
                    //logger.debug("cdt : ", cdt);
                    //logger.debug("JSON.stringify(cdt) : ", JSON.stringify(cdt));
                    //logger.debug("condition : ", condition);
                    //logger.debug("JSON.stringify(condition) : ", JSON.stringify(condition));
                    //logger.debug("=============================================");

                    callback(condition);
                }

            }], function (condition) {

                //logger.debug("=============================================");
                //logger.debug("condition 1111: ", condition);
                //logger.debug("JSON.stringify(condition) 1111 : ", JSON.stringify(condition));
                //logger.debug("=============================================");


                var aggregatorOpts = [{
                    $match: condition
                }, {
                    $group: { //그룹칼럼
                        _id: {
                            //register_yyyy: "$register_yyyy",
                            status_cd: "$status_cd"
                            //higher_cd: "$higher_cd"
                            //status_cd: { $ifNull: [ '$status_cd', [{ count: 0 }] ] }
                        },
                        count: {
                            $sum: 1
                            //$sum : { $ifNull: [ $sum, 0 ] }
                            //$sum :{ $ifNull: [ "$count", 1] }
                        }

                    }
                }

                    //, {
                    //    total: { 
                    //        $sum: "$count"
                    //    } 
                    //}

                    , {
                    $sort: {
                        status_cd: -1
                    }
                }
                ]

                IncidentModel.aggregate(aggregatorOpts).exec(function (err, incident) {

                    //IncidentModel.count({status_cd: '4', manager_company_cd : "ISU_ST", manager_email : "14002"}, function (err, incident) {

                    //logger.debug("==================================================");
                    //logger.debug(" aggregatorOpts : ", JSON.stringify(aggregatorOpts));
                    //logger.debug(" incident : ", JSON.stringify(incident));
                    //logger.debug("==================================================");

                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    }

                    res.json(incident);
                });


            });





        } catch (e) {

            logger.error("======================================");
            logger.error("cntload error : ", e);
            logger.error("======================================");

        } finally { }

    },



    /**
     * 고객사 관리자 메인 카운트 로드 (user_flag='5')
     */
    deptcntload: (req, res, next) => {
        var today = new Date();
        var thisYear = today.getFullYear();

        var aggregatorOpts = [{
            $match: { //조건
                //manager_company_cd : req.session.company_cd  //각 사별 관리담당자는?
                //,manager_email : req.session.sabun
                //,manager_email : req.session.email      //req.session.sabun 넣을 예정 ??
                //,
                //manager_dept_cd: req.session.dept_cd,
                $or: [{
                    status_cd: "1"
                }, {
                    status_cd: "2"
                }, {
                    status_cd: "3"
                }, {
                    status_cd: "4"
                }]
                //,$and : [ { register_date : {$gte: "2017-05-19T04:49:38.881Z"}}
                //         ,{ register_date : {$lte:"2017-11-15T04:49:38.881Z"}} ]
                //,register_date : {$gte: "2017-10-19T04:49:38.881Z", $lte:"2017-11-15T04:49:38.881Z"}
                //,register_date : {$gte: new Date(new Date().setDate(new Date().getDate()-180)), $lte: new Date()}
                //, register_date: { $gte: startDate, $lte: endDate }
                ,
                register_yyyy: thisYear.toString()

            }
        }, {
            $group: { //그룹칼럼
                _id: {
                    status_cd: "$status_cd"
                    //status_cd: { $ifNull: [ '$status_cd', [{ count: 0 }] ] }
                },
                count: {
                    $sum: 1
                    //$sum : { $ifNull: [ $sum, 0 ] }
                    //$sum :{ $ifNull: [ "$count", 1] }
                }

            }
        }
            /*
            , {
                total: { 
                    $sum: "$count"
                } 
            }
            */
            , {
            $sort: {
                status_cd: -1
            }
        }
        ]
        //console.log("deptcntload aggregatorOpts >> "+JSON.stringify(aggregatorOpts));         
        IncidentModel.aggregate(aggregatorOpts).exec(function (err, incident) {
            //IncidentModel.count({status_cd: '4', manager_company_cd : "ISU_ST", manager_email : "14002"}, function (err, incident) {
            //console.log("dept incident"+JSON.stringify(incident));    
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            }

            res.json(incident);
        });
    },

    //관리자 차트
    chartLoad: (req, res, next) => {

        try{
            async.waterfall([function (callback) {

                var today = new Date();
                var thisYear = today.getFullYear();
                var preYear = thisYear - 1;
                var condition = {};
                var OrQueries = [];
                var AndQueries = [];


                if (req.session.user_flag == 3 || req.session.user_flag == 4) {
                    
                    //나의업무지정 상위업무 처리 위한 조건
                    var condition2 = {};
                    condition2.email = req.session.email;
                    MyProcess.find(condition2).distinct('higher_cd').exec(function (err, myHigherProcess) {

                        if (condition.$and == null) {

                            condition.$and = [{
                                "higher_cd": {
                                    "$in": myHigherProcess
                                }
                            }];

                        } else {

                            condition.$and.push({
                                "higher_cd": {
                                    "$in": myHigherProcess
                                }
                            });
                        }

                        if (condition.$and == null) {

                            condition.$and = [{
                                register_yyyy: {
                                    $gte: preYear.toString(),
                                    $lte: thisYear.toString()
                                }
                            }];

                        } else {

                            condition.$and.push({
                                register_yyyy: {
                                    $gte: preYear.toString(),
                                    $lte: thisYear.toString()
                                }
                            });

                        }
                        callback(null, condition);
                    });

                } else {

                    if (req.session.user_flag == 1) {        //전체관리자

                    //} else if (req.session.user_flag == 3) {  //업무관리자

                    //    condition.manager_dept_cd = req.session.dept_cd;

                    } else if (req.session.user_flag == 5) {  //고객사관리자

                        condition.request_company_cd = req.session.company_cd;

                    } else if (req.session.user_flag == 9) {  //일반사용자

                        condition.request_id = req.session.email;

                    }

                    if (condition.$and == null) {

                        condition.$and = [{
                            register_yyyy: {
                                $gte: preYear.toString(),
                                $lte: thisYear.toString()
                            }
                        }];

                    } else {

                        condition.$and.push({
                            register_yyyy: {
                                $gte: preYear.toString(),
                                $lte: thisYear.toString()
                            }
                        });

                    }
                    callback(null, condition)
                };

            }], function (err, condition) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                } else {
                    async.waterfall([function (callback) {

                        var aggregatorOpts = [{
                            $match: condition 
                        }, {
                            $group: { //그룹
                                _id: {
                                    register_yyyy: "$register_yyyy",
                                    register_mm: "$register_mm"
                                },
                                count: {
                                    $sum: 1
                                }
                            }
                        }, {
                            $sort: {
                                register_yyyy: -1,
                                register_mm: -1
                            }
                        }]
            
                        IncidentModel.aggregate(aggregatorOpts).exec(function (err, incident) {
                           
                            if (err) {
                                return res.json({
                                    success: false,
                                    message: err
                                });
                            } else {
                                callback(null, incident)
                            }
                            /*
                            if (condition.$and == null) {
                                condition.$and = [{
                                    status_cd: {
                                        $gte: '3',
                                        $lte: '4'
                                    }
                                }];
                            } else {
        
                                condition.$and.push({
                                    status_cd: {
                                        $gte: '3',
                                        $lte: '4'
                                    }
                                });
                            }
                            */
                        });
                    
                    }, function (incident, callback) {

                        var aggregatorOpts = [{
                            $match:condition
                        }, {
                            $group: { //그룹
                                _id: {
                                    register_yyyy: "$register_yyyy",
                                    register_mm: "$register_mm",
                                },
                                count: {
                                    $sum: 1
                                }
            
                            }
                        }, {
                            $sort: {
                                register_yyyy: -1,
                                register_mm: -1,
                                status_cd: -1
                            }
                        }]

                        IncidentModel.aggregate(aggregatorOpts).exec(function (err, incident2) {
                            if (err) {
                                return res.json({
                                    success: false,
                                    message: err
                                });
                            } else {
                                callback(null, incident, incident2)
                            }
                        });
                    }], function (err, incident, incident2) {
                        var aggregatorOpts = [{
                            $match: condition
                                /*
                                { 
                                register_yyyy: {
                                    $gte: preYear.toString(),
                                    $lte: thisYear.toString()
                                }
                                
                                }*/
                        }, {
                            $group: { 
                                _id: {
                                    register_yyyy: "$register_yyyy",
                                },
                                count: {
                                    $sum: 1
                                }
            
                            }
                        }, {
                            $sort: {
                                register_yyyy: -1,
                            }
                        }]
            
                        IncidentModel.aggregate(aggregatorOpts).exec(function (err, incident3) {
                            if (err) {
                                return res.json({
                                    success: false,
                                    message: err
                                });
                            } else {
                                res.json(mergeChart(setChartData(incident), setChartCompleteData(incident2), incident3));
                            }
                        });
                    });
                }
            });
        }catch (e) {

            logger.error("======================================");
            logger.error("chartload error : ", e);
            logger.error("======================================");

        } finally { }

    },

    //팀장 차트
    deptchartLoad: (req, res, next) => {
        var today = new Date();
        var thisYear = today.getFullYear();
        var preYear = thisYear - 1;

        var condition = {};
        if (req.session.group_flag == "in") {
            condition.manager_dept_cd = req.session.dept_cd;
        } else if (req.session.group_flag == "out") {
            condition.request_company_cd = req.session.company_cd;
        }
        condition.register_yyyy = {
            $gte: preYear.toString(),
            $lte: thisYear.toString()
        }

        async.waterfall([function (callback) {
            var aggregatorOpts = [{
                $match: condition //조건
            }, {
                $group: { //그룹
                    _id: {
                        register_yyyy: "$register_yyyy",
                        register_mm: "$register_mm"
                    },
                    count: {
                        $sum: 1
                    }
                }
            }, {
                $sort: {
                    register_yyyy: -1,
                    register_mm: -1
                }
            }]

            IncidentModel.aggregate(aggregatorOpts).exec(function (err, incident) {
                //console.log("incident >>>>>> " + JSON.stringify(incident));
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
            var aggregatorOpts = [{
                $match: { //조건
                    condition,
                    status_cd: {
                        $gte: '3',
                        $lte: '4'
                    }
                }
            }, {
                $group: { //그룹
                    _id: {
                        register_yyyy: "$register_yyyy",
                        register_mm: "$register_mm",
                    },
                    count: {
                        $sum: 1
                    }

                }
            }, {
                $sort: {
                    register_yyyy: -1,
                    register_mm: -1,
                    status_cd: -1
                }
            }]

            IncidentModel.aggregate(aggregatorOpts).exec(function (err, incident2) {
                //console.log("incident2 >>>>>> " + JSON.stringify(incident2));
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {
                    callback(null, incident, incident2)
                }
            });
        }], function (err, incident, incident2) {
            var aggregatorOpts = [{
                $match: { //조건
                    register_yyyy: {
                        $gte: preYear.toString(),
                        $lte: thisYear.toString()
                    }
                }
            }, {
                $group: { //그룹
                    _id: {
                        register_yyyy: "$register_yyyy",
                    },
                    count: {
                        $sum: 1
                    }

                }
            }, {
                $sort: {
                    register_yyyy: -1,
                }
            }]

            IncidentModel.aggregate(aggregatorOpts).exec(function (err, incident3) {
                //console.log("incident2 >>>>>> " + JSON.stringify(incident2));
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {
                    res.json(mergeChart(setChartData(incident), setChartCompleteData(incident2), incident3));
                }
            });
        });
    },

    /**
     * 만족도 현황 
     */
    monthlyload: (req, res, next) => {

        try {
            async.waterfall([function (callback) {


                var today = new Date();
                var thisYear = today.getFullYear();

                var condition = {};
                var OrQueries = [];
                var AndQueries = [];

                if (req.session.user_flag == 3 || req.session.user_flag == 4) {

                    //나의업무지정 상위업무 처리 위한 조건
                    var condition2 = {};
                    condition2.email = req.session.email;
                    MyProcess.find(condition2).distinct('higher_cd').exec(function (err, myHigherProcess) {

                        if (condition.$and == null) {

                            condition.$and = [{
                                "higher_cd": {
                                    "$in": myHigherProcess
                                }
                            }];

                        } else {

                            condition.$and.push({
                                "higher_cd": {
                                    "$in": myHigherProcess
                                }
                            });
                        }

                        if (condition.$and == null) {

                            condition.$and = [{
                                "status_cd": {
                                    "$in": ["4"]
                                }
                            }];

                        } else {

                            condition.$and = [{
                                "status_cd": {
                                    "$in": ["4"]
                                }
                            }];

                        }


                        if (condition.$and == null) {

                            condition.$and = [{
                                "register_yyyy": thisYear.toString()
                            }];

                        } else {

                            condition.$and.push({
                                "register_yyyy": thisYear.toString()
                            });

                        }

                        callback(condition);

                    });

                } else {

                    if (req.session.user_flag == 1) {        //전체관리자

                    //} else if (req.session.user_flag == 3) {  //업무관리자

                    //    condition.manager_dept_cd = req.session.dept_cd;

                    } else if (req.session.user_flag == 5) {  //고객사관리자

                        condition.request_company_cd = req.session.company_cd;

                    } else if (req.session.user_flag == 9) {  //일반사용자

                        condition.request_id = req.session.email;

                    }

                    if (condition.$and == null) {

                        condition.$and = [{
                            "status_cd": {
                                "$in": ["4"]
                            }
                        }];

                    } else {

                        condition.$and = [{
                            "status_cd": {
                                "$in": ["4"]
                            }
                        }];
                    }

                    if (condition.$and == null) {

                        condition.$and = [{
                            "register_yyyy": thisYear.toString()
                        }];

                    } else {

                        condition.$and.push({
                            "register_yyyy": thisYear.toString()
                        });

                    }
                    callback(condition);
                }

            }], function (condition) {

                var aggregatorOpts = [{
                    $match: condition
                }, {
                    $group: { //그룹칼럼
                        _id: {
                            //register_yyyy : "$register_yyyy"
                            register_mm: "$register_mm"
                        },
                        count: {
                            $sum: 1
                        },
                        avgValue: {
                            $avg: "$valuation"
                        }

                    }
                }, {
                    $sort: {
                        register_mm: -1
                    }
                }
                ]

                IncidentModel.aggregate(aggregatorOpts).exec(function (err, incident) {

                    //logger.debug("==================================================");
                    //logger.debug(" aggregatorOpts >> : ", JSON.stringify(aggregatorOpts));
                    //logger.debug(" incident >> : ", JSON.stringify(incident));
                    //logger.debug("==================================================");

                    if (err) {
                        return res.json({
                            success: false,
                            message: err
                        });
                    }

                    res.json(setMonthData(incident));
                });

            });

        } catch (e) {

            logger.error("======================================");
            logger.error("cntload error : ", e);
            logger.error("======================================");

        } finally { }
    },

    /**
     * 팀장 만족도 현황 
     */
    deptmonthlyLoad: (req, res, next) => {
        var today = new Date();
        var thisYear = today.getFullYear();


        var aggregatorOpts = [{
            $match: { //조건
                //manager_company_cd : "ISU_ST"  //각 사별 관리담당자는?
                //,manager_email : "12001"     //req.session.sabun 넣을 예정
                manager_dept_cd: req.session.dept_cd,
                status_cd: "4",
                register_yyyy: thisYear.toString()
            }
        }, {
            $group: { //그룹칼럼
                _id: {
                    //register_yyyy : "$register_yyyy"
                    register_mm: "$register_mm"
                },
                count: {
                    $sum: 1
                },
                avgValue: {
                    $avg: "$valuation"
                }

            }
        }, {
            $sort: {
                register_mm: -1
            }
        }]

        //console.log("deptmonthlyload aggregatorOpts >> "+JSON.stringify(aggregatorOpts)+thisYear); 
        IncidentModel.aggregate(aggregatorOpts).exec(function (err, incident) {
            //IncidentModel.count({status_cd: '4', manager_company_cd : "ISU_ST", manager_email : "14002"}, function (err, incident) {
            //console.log("deptmonthlyload incident >> "+JSON.stringify(incident));    
            if (err) {
                return res.json({
                    success: false,
                    message: err
                });
            } else {
                res.json(setMonthData(incident));
            }
        });
    },

    /**
     * 담당자별 월별처리 내역
     */
    mng_month: (req, res, next) => {
        res.render("statistic/mng_month",{cache : true});
    },

    /**
     * 담당자별 월별처리 통계 데이타 조회
     */
    getMngMonth: (req, res, next) => {
        
        logger.debug("==================================================");
        logger.debug(" IncidentModel getMngMonth : ");
        logger.debug("==================================================");

        
        var svc = service.mng_month(req);

        IncidentModel.aggregate(svc.aggregatorOpts)
            .exec(function (err, incident) {

            if (err) {

                logger.debug("==================================================");
                logger.debug(" IncidentModel.aggregate error ", err);
                logger.debug("==================================================");

                return res.json({
                    success: false,
                    message: err
                });

            } else {

                incident.forEach(function (data, idx, incident) {

                    logger.debug("==================================================");
                    logger.debug("data ", JSON.stringify(data));
                    logger.debug("data.grp.length ", data.grp.length);
                    logger.debug("==================================================");


                    var totalCnt = 0; //전체 개수
                    var stCnt1 = 0; //신청중 개수
                    var stCnt2 = 0; //처리중 개수
                    var stCnt3 = 0; //미평가
                    var stCnt4 = 0; //완료
                    var stCnt5 = 0; //협의필요  개수
                    var stCnt3_4 = 0; //미평가+완료 개수


                    for (var i = 0; i < data.grp.length; i++) {
                        //전체 개수
                        totalCnt = totalCnt + data.grp[i].count;

                        //신청중 개수
                        if (data.grp[i].status_cd == '1') {
                            stCnt1 = stCnt1 + data.grp[i].count;
                        }

                        //처리중 개수
                        if (data.grp[i].status_cd == '2') {
                            stCnt2 = stCnt2 + data.grp[i].count;
                        }

                        //미평가 개수
                        if (data.grp[i].status_cd == '3') {
                            stCnt3 = stCnt3 + data.grp[i].count;
                        }

                        //완료 개수
                        if (data.grp[i].status_cd == '4') {
                            stCnt4 = stCnt4 + data.grp[i].count;
                        }

                        //협의필요 
                        if (data.grp[i].status_cd == '5') {
                            stCnt5 = stCnt5 + data.grp[i].count;
                        }

                        //완료 또는 미평가
                        if (data.grp[i].status_cd == '3' || data.grp[i].status_cd == '4') {
                            stCnt3_4 = stCnt3_4 + data.grp[i].count;
                        }
                    }

                    data.totalCnt = totalCnt;
                    data.stCnt1 = stCnt1;
                    data.stCnt2 = stCnt2;
                    data.stCnt3 = stCnt3;
                    data.stCnt4 = stCnt4;
                    data.stCnt5 = stCnt5;
                    data.stCnt3_4 = stCnt3_4;
                    data.solRatio = ((stCnt3_4 * 100) / totalCnt).toFixed(2);

                    //평점
                    if (data.valuationSum > 0) {
                        data.valAvg = (data.valuationSum / stCnt4).toFixed(2);
                    } else {
                        data.valAvg = 0;
                    }

                    logger.debug("==================================================");
                    logger.debug("data.totalCnt : ", data.totalCnt);
                    logger.debug("data.stCnt1 : ", data.stCnt1);
                    logger.debug("data.stCnt2 : ", data.stCnt2);
                    logger.debug("data.stCnt3 : ", data.stCnt3);
                    logger.debug("data.stCnt4 : ", data.stCnt4);
                    logger.debug("data.solRatio : ", data.solRatio);
                    logger.debug("data.valuationSum : ", data.valuationSum);
                    logger.debug("data.valAvg : ", data.valAvg);
                    logger.debug("==================================================");

                });

                res.json(incident);
            }
        })
        
    },
    
    /**
     * 처리구분별 월별처리 내역
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
            res.render("statistic/status_list", {
                cache : true,
                incident: incident
            });
        });
    },
    
    
};

function setMonthData(srcData) {
    var rtnJSON = {};
    var cnt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var avg = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    //var rtnJSON = new Array(12);
    try {

        //[{"_id":{"register_mm":"11"},"count":5,"avgValue":4.6},{"_id":{"register_mm":"05"},"

        for (var i = 0; i < srcData.length; i++) {

            //console.log(Number(srcData[i]._id.register_mm));
            var idx = Number(srcData[i]._id.register_mm);
            //console.log("idx : "+ idx + Number(srcData[i]._id.register_mm));
            cnt.splice(idx - 1, 1, srcData[i].count);
            //avg.splice( idx , 1 , Math.round(srcData[i].avgValue,-2) );
            avg.splice(idx - 1, 1, srcData[i].avgValue.toFixed(2));
        }

        rtnJSON = {
            cnt: cnt,
            avg: avg
        };

        //console.log(JSON.stringify(rtnJSON));

    } catch (e) {
        logger.error("control useremanage mergeUser : ", e);
    } finally { }
    return rtnJSON;
}

//KSY 등록일별 카운트
function setChartData(srcData) {
    var rtnJSON = {};
    var cnt1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var cnt2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var cnt3 = 0;
    var today = new Date();
    var thisYear = today.getFullYear();
    var lastYear = thisYear - 1;

    try {
        for (var i = 0; i < srcData.length; i++) {
            if (Number(srcData[i]._id.register_yyyy) == lastYear) {
                var idx = Number(srcData[i]._id.register_mm);
                cnt1.splice(idx - 1, 1, srcData[i].count);
            } else if (Number(srcData[i]._id.register_yyyy) == thisYear) {
                var idx = Number(srcData[i]._id.register_mm);
                cnt2.splice(idx - 1, 1, srcData[i].count);
            }

            if (i == 0) {
                cnt3 = srcData[i].count;
            } else {
                if (cnt3 < srcData[i].count) {
                    cnt3 = srcData[i].count;
                }
            }
        }

        rtnJSON = {
            //cnt: cnt2.concat(cnt1)
            cnt1: cnt1,
            cnt2: cnt2,
            cnt3: cnt3
        };
    } catch (e) {
        logger.error("controller statistic setChartData : ", e);
    } finally { }
    return rtnJSON;
}

//KSY 등록일별 미평가 및 완료 카운트
function setChartCompleteData(srcData) {
    var rtnJSON = {};
    var cnt1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var cnt2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var today = new Date();
    var thisYear = today.getFullYear();
    var lastYear = thisYear - 1;

    try {
        for (var i = 0; i < srcData.length; i++) {
            if (Number(srcData[i]._id.register_yyyy) == lastYear) {
                var idx = Number(srcData[i]._id.register_mm);
                cnt1.splice(idx - 1, 1, srcData[i].count);
            } else if (Number(srcData[i]._id.register_yyyy) == thisYear) {
                var idx = Number(srcData[i]._id.register_mm);
                cnt2.splice(idx - 1, 1, srcData[i].count);
            }
        }
        rtnJSON = {
            cntCom: cnt2.concat(cnt1)
        };
    } catch (e) {
        logger.error("controller statistic setChartCompleteData : ", e);
    } finally { }
    return rtnJSON;
}

function mergeChart(trg1, trg2, trg3) {
    var rtnJSON = [];
    try {
        /*
        for (var i = 0; i < trg1.length; i++) {
            rtnJSON.push(trg1[i]);
        }
        for (var i = 0; i < trg2.length; i++) {
            rtnJSON.push(trg2[i]);
        }
        */
        rtnJSON.push(trg1);
        rtnJSON.push(trg2);
        for (var i = 0; i < trg3.length; i++) {
            rtnJSON.push(trg3[i]);
        }
    } catch (e) {
        logger.error("control statistic mergeChart : ", e);
    }
    //console.log('rtnJSON >>> ', rtnJSON);
    return rtnJSON;
}