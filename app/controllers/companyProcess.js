'use strict';

const mongoose = require('mongoose');
const async = require('async');
const CompanyProcessModel = require('../models/CompanyProcess');
const HigherProcessModel = require('../models/HigherProcess');
const OftenQnaModel = require('../models/OftenQna')
const logger = require('log4js').getLogger('app');
const Iconv = require('iconv-lite');

module.exports = {

    /**
     * 회사 상위 업무 수정 화면
     */
    edit: (req, res, next) => {

        //logger.debug("==========================================companyProcess edit=======================================");
        //logger.debug("====================================================================================================");

        try {
            res.render("companyProcess/edit",{cache : true});
        } catch (e) {
            logger.error("companyProcess edit error ", e);
        } finally {}

    },


    update: (req, res, next) => {
        try{

            //logger.debug("==========================================companyProcess update=======================================");
            //logger.debug("req.body.company_cd : ",req.body.company_cd);
            //logger.debug("req.body.companyProcess : ",req.body.companyProcess);
            //logger.debug("======================================================================================================");

            var condition = {}; //조건
            condition.company_cd    = req.body.company_cd; //회사코드

            //logger.debug("==========================================companyProcess update=======================================");
            //logger.debug("condition : ",condition);
            //logger.debug("=================================================================================================");

            CompanyProcessModel.deleteMany(condition, function( err, writeOpResult ){
                if (err){ 
                    res.json({
                        success: false,
                        message: err
                    });
                }else{

                    //logger.debug("==================================MyProcessModel.deleteMany======================================");
                    //logger.debug("writeOpResult : ", writeOpResult); //처리결과
                    //logger.debug("=================================================================================================");
                   
                    if(req.body.companyProcess != ""){
                        var newCompanyProcess = setNewCompanyProcess(req);
                    
                        //logger.debug("======================================ProcessModel.create======================================");
                        //logger.debug("newCompanyProcess : ", newCompanyProcess); 
                        //logger.debug("=================================================================================================");
        
                        CompanyProcessModel.create(newCompanyProcess, function (err, writeOpResult) {
                            if (err) {

                                //logger.debug("======================================CompanyProcessModel.create======================================");
                                //logger.debug("err : ", err); 
                                //logger.debug("=================================================================================================");

                                res.json({
                                    success: false,
                                    message: err
                                }); 
                            } else {

                                //logger.debug("======================================CompanyProcessModel.create======================================");
                                //logger.debug("writeOpResult : ", writeOpResult); //처리결과
                                //logger.debug("=================================================================================================");
                        
                                res.json({
                                    success: true,
                                    message: "저장되었습니다."
                                }); 
                            }
                        });
                    }else{
                        res.json({
                            success: true,
                            message: "저장되었습니다."
                        }); 
                    }
                }
            });
        }catch(e){
            logger.error("CompanyProcessModel error : ", e);
        }finally{}
    },

    /**
     * 회사별 상위 업무 조회
     */
    getCompanyProcess: (req, res, next) => {
        try {
            var condition = {};
            if (req.query.company_cd != null) {
                condition.company_cd = req.query.company_cd;
            }

            //logger.debug("==========================================getCompanyProcess=========================================");
            //logger.debug("condition : ", condition);
            //logger.debug("====================================================================================================");

            CompanyProcessModel.find(condition, function (err, companyProcess) {
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {

                    //logger.debug("======================================CompanyProcessModel.find======================================");
                    //logger.debug("companyProcess : ", companyProcess);
                    //logger.debug("====================================================================================================");

                    res.json(companyProcess);
                }
            }).sort('higher_cd');
        } catch (e) {
            logger.error("CompanyProcessModel.find error : ", e);
        }
    },

    /**
     * 상위업무에 따른 회사 조회 -> 자주묻는질문과답 사용
     */

    getCompany :  (req, res, next) => {
        try {
            
            var condition = {};
            if (req.query.higher_cd != null) {
                condition.higher_cd = req.query.higher_cd;
            }
            
            //logger.debug("==========================================getCompany=========================================");
            //logger.debug("condition : ", condition);
            //logger.debug("====================================================================================================");


            //>>>>> 상위업무에 매핑되는 회사명 찾기
            var aggregatorOpts = [{
                $match: condition
            }, {
                $group: { //그룹
                    _id: {
                        company_cd: "$company_cd"
                    }
                }
            }, {
                $lookup: {
                    from: "companies", // join 할 collection명
                    localField: "_id.company_cd", // 기본 키($group에서 얻은 값)
                    foreignField: "company_cd", // 외래 키(usermanagers collection에 값) 
                    as: "company_nm" // 결과를 배출할 alias ( 필드명 )
                }
            }, {
                $project: {
                    "company_nm.company_nm": 1,
                    "company_nm.company_cd": 1
                }
            },  {
                    $sort: {
                        "company_nm.company_nm": 1
                }
            }]

            logger.debug("========================================================================");
            logger.debug("getCompany aggregate!!! aggregatorOpts  ", JSON.stringify(aggregatorOpts));
            logger.debug("========================================================================");
            
            //MyProcess.aggregate(aggregatorOpts).exec(function (err, targetUser) {
            //CompanyProcessModel.find(condition, function (err, companyProcess) {
            CompanyProcessModel.aggregate(aggregatorOpts).exec(function (err, companyProcess) {
                logger.debug("companyProcess : "+ JSON.stringify(companyProcess));
                logger.debug("companyProcess length : " + companyProcess.length);
                if (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                } else {
                    res.json(companyProcess);
                }
            });
        } catch (e) {
            //logger.error("getCompany.find error : ", e);
        }
    },
    
};


/**
 * 문자열을 객체 배열로 치환
 * @param {*} companyProcess : 나의 업무 문자열
 */
function setNewCompanyProcess(req){
    
        var lowerList = req.body.companyProcess.split(',');
        var companyProcessArr = new Array(lowerList.length); //반환 객체
    
        for(var i = 0 ; i < lowerList.length ; i++){
            
            var tmpValue = lowerList[i].split('^');
            var tmpMP = {};
            
            tmpMP.company_cd    = req.body.company_cd;
            tmpMP.higher_cd     = tmpValue[0];
            tmpMP.higher_nm     = tmpValue[1];

            companyProcessArr[i]     = tmpMP;
    
            //logger.debug("======================================setNewCompanyProcess===.====================================");
            //logger.debug("tmpMP["+i+"]", tmpMP);
            //logger.debug("==================================================================================================");
    
        }
        
        return companyProcessArr;
    }