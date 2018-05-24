'use strict';

const mongoose = require('mongoose');
const async = require('async');
const MyProcessModel = require('../models/MyProcess');
const HigherProcessModel = require('../models/HigherProcess');
const CompanyModel = require('../models/Company');
const logger = require('log4js').getLogger('app');
const Iconv = require('iconv-lite');

module.exports = {

    edit: (req, res, next) => {
        try{
            HigherProcessModel.find({}, function (err, higherprocess) {
                if (err) {
                    res.render("http/500", {
                        cache : true,
                        err: err
                    });
                }else{
                    res.render("myProcess/edit",{cache : true});
                }
            });
        }catch(e){
            logger.error("myProcess controllers edit : ", e);
        }finally{}
    },

    update: (req, res, next) => {
        try{
            //logger.debug("==========================================myProcess update=======================================");
            //logger.debug("req.body.higher_cd : ",req.body.higher_cd);
            //logger.debug("req.body.myProcess : ",req.body.myProcess);
            //logger.debug("=================================================================================================");

            var condition = {}; //조건
            condition.company_cd    = req.session.company_cd; //회사코드
            condition.email         = req.session.email; //이메일
            if(req.body.higher_cd != null && req.body.higher_cd != "*"){
                condition.higher_cd = req.body.higher_cd;
            }

            //logger.debug("==========================================myProcess update=======================================");
            //logger.debug("condition : ",condition);
            //logger.debug("=================================================================================================");

            MyProcessModel.deleteMany(condition, function( err, writeOpResult ){
                
                if (err){

                    //logger.debug("==================================MyProcessModel.deleteMany======================================");
                    //logger.debug("err : ", err); //처리결과
                    //logger.debug("=================================================================================================");
                    
                    
                    res.json({
                        success: false,
                        message: err
                    });
                }else{

                    //logger.debug("==================================MyProcessModel.deleteMany======================================");
                    //logger.debug("writeOpResult : ", writeOpResult); //처리결과
                    //logger.debug("=================================================================================================");
                    
                    if(req.body.myProcess != ""){
                        var newMyProcessModel = setNewMyProcess(req);
                        
                        //logger.debug("======================================MyProcessModel.create======================================");
                        //logger.debug("newMyProcessModel : ", newMyProcessModel); 
                        //logger.debug("=================================================================================================");
        
                        MyProcessModel.create(newMyProcessModel, function (err, writeOpResult) {
                            if (err) {
                                res.json({
                                    success: false,
                                    message: err
                                }); 
                            } else {

                                //logger.debug("======================================MyProcessModel.create======================================");
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
            logger.error("myProcess controllers update : ", e);
        }finally{}
    },

    /**
     * 담당자 업무를 조회
     */
    getMyProcess : (req, res, next) => {
        try{

            var condition = {}; //조건
            condition.company_cd    = req.session.company_cd; //회사코드
            condition.email         = req.session.email; //이메일

            logger.debug("==========================================getMyProcess=======================================");
            logger.debug("condition : ",condition);
            logger.debug("=============================================================================================");
            
            MyProcessModel.find(condition, function (err, myProcess) {
                if (err){ 
                    res.json({
                        success: false,
                        message: err
                    });
                }else{

                    logger.debug("==========================================getMyProcess=======================================");
                    logger.debug("getmyProcess : ",JSON.stringify(myProcess));
                    logger.debug("=============================================================================================");

                    res.json(myProcess);
                }
            });

        }catch(e){
            logger.error("myProcess controllers getMyProcess : ", e);
        }finally{}
    },

    /**
     * 담당자 상위업무를 조회
     */
    getMyHigherProcess : (req, callback) => {
        try{

            var condition = {}; //조건
            condition.company_cd    = req.session.company_cd; //회사코드
            condition.email         = req.session.email; //이메일
            

            MyProcessModel.find(condition).distinct('higher_cd').exec(function(err, getMyHigherProcess){

                //logger.debug("=============================================");
                //logger.debug("getMyHigherProcess : ", getMyHigherProcess);
                //logger.debug("=============================================");
 
                return callback(getMyHigherProcess);
 
            });

        }catch(e){
            logger.error("getMyHigherProcess controllers getMyProcess err: ", e);
        }finally{
        }
    },
};

/**
 * 문자열을 객체 배열로 치환
 * @param {*} myProcess : 나의 업무 문자열
 */
function setNewMyProcess(req){
    
    var lowerList = req.body.myProcess.split(',');
    //logger.debug("==========================================setNewMyProcess=======================================");
    //logger.debug("req.body.myProcess", req.body.myProcess);
    //logger.debug("lowerList", lowerList);
    //logger.debug("================================================================================================");


    var myProcessArr = new Array(lowerList.length); //반환 객체

    for(var i = 0 ; i < lowerList.length ; i++){
        
        var tmpValue = lowerList[i].split('^');
        var tmpMP = {};
        
        tmpMP.company_cd    = req.session.company_cd;
        tmpMP.company_nm    = req.session.company_nm;
        tmpMP.dept_cd       = req.session.dept_cd;
        tmpMP.dept_nm       = req.session.dept_nm;
        tmpMP.email         = req.session.email;
        tmpMP.employee_nm   = req.session.employee_nm;
        tmpMP.higher_cd     = tmpValue[0];
        tmpMP.higher_nm     = tmpValue[1];
        tmpMP.lower_cd      = tmpValue[2];
        tmpMP.lower_nm      = tmpValue[3];

        myProcessArr[i]     = tmpMP;

        //logger.debug("==========================================setNewMyProcess=======================================");
        //logger.debug("tmpMP["+i+"]", tmpMP);
        //logger.debug("================================================================================================");

    }
    
    return myProcessArr;
}
