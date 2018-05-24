'use strict';

const mongoose = require('mongoose');
const async = require('async');
const IncidentModel = require('../models/Incident');
const CompanyModel = require('../models/Company');
const logger = require('log4js').getLogger('app');

module.exports = {

    hr: (req, res, next) => {
        var condition = {};
        condition.higher_cd = 'H008'; //OPTI-HR 코드
        
        if(req.query.yyyy != null){
            condition.register_yyyy = req.query.yyyy;
        }
        if(req.query.mm != null){
            condition.register_mm = req.query.mm;
        }
        
        //logger.debug("=====================");
        //logger.debug("condition : ", condition);
        //logger.debug("=====================");

        try{
            IncidentModel.find(condition, function (err, incident) {
                if (err) {
                    res.json(null);
                }else{

                    //logger.debug("=====================");
                    //logger.debug("newIncident : ", JSON.stringify(incident));
                    //logger.debug("=====================");

                    var rtnVal = [];

                    incident.forEach(function(incident, index, incidentArray){
                        
                        var newIncident = {};
                        
                        newIncident.higher_cd             = incident.higher_cd               //상위업무 코드
                        newIncident.higher_nm             = incident.higher_nm               //상위업무 이름                                             
                        newIncident.lower_cd              = incident.lower_cd                //하위업무 코드
                        newIncident.lower_nm              = incident.lower_nm                //하위업무 이름                                                                                                                      
                        newIncident.status_cd             = incident.status_cd               //진행상태(processStatus 모델)  
                        newIncident.status_nm             = incident.status_nm               //진행상태명            
                        newIncident.process_speed         = incident.process_speed           //긴급구분                                                                                                                                       
                        newIncident.title                 = incident.title                   //제목 
                        newIncident.content               = incident.content                 //내용                                                                       
                        newIncident.request_company_cd    = incident.request_company_cd      //요청자 회사코드
                        newIncident.request_company_nm    = incident.request_company_nm      //요청자 회사명                                                              
                        newIncident.request_dept_cd       = incident.request_dept_cd         //요청자 부서코드
                        newIncident.request_dept_nm       = incident.request_dept_nm         //요청자 부서명 
                        newIncident.request_email         = incident.request_id              //요청자 계정
                        newIncident.request_nm            = incident.request_nm              //요청자 명                                                               
                        newIncident.request_complete_date = incident.request_complete_date   //완료요청일
                        newIncident.register_company_cd   = incident.register_company_cd     //등록자 회사코드  
                        newIncident.register_company_nm   = incident.register_company_nm     //등록자 회사명                                                              
                        newIncident.register_sabun        = incident.register_sabun          //등록자 사번 
                        newIncident.register_nm           = incident.register_nm             //등록자 명                                                                
                        newIncident.register_date         = incident.register_date           //등록일                                                                     
                        newIncident.register_yyyy         = incident.register_yyyy           //등록년                                                                     
                        newIncident.register_mm           = incident.register_mm             //등록월
                        newIncident.register_dd           = incident.register_dd             //등록일자 
                        newIncident.app_menu              = incident.app_menu                //문의 메뉴 경로                                                                                                                                             
                        newIncident.receipt_content       = incident.receipt_content         //접수내용                                                                         
                        newIncident.manager_company_cd    = incident.manager_company_cd      //담당자 회사코드
                        newIncident.manager_company_nm    = incident.manager_company_nm      //담당자 회사명
                        newIncident.manager_nm            = incident.manager_nm              //담당자 명
                        newIncident.manager_dept_cd       = incident.manager_dept_cd         //담당자 부코드
                        newIncident.manager_dept_nm       = incident.manager_dept_nm         //담당자 부서명
                        newIncident.manager_position      = incident.manager_position        //담당자 직위명
                        newIncident.manager_email         = incident.manager_email           //담당자 이메일
                        newIncident.manager_phone         = incident.manager_phone           //담당자 전화
                        newIncident.receipt_date          = incident.receipt_date            //접수일
                        newIncident.business_level        = incident.business_level          //난이도
                        newIncident.complete_reserve_date = incident.complete_reserve_date   //완료예정일
                        newIncident.solution_flag         = incident.solution_flag           //해결여부
                        newIncident.complete_content      = incident.complete_content        //완료 코멘트                                                                                                                                              
                        newIncident.delay_reason          = incident.delay_reason            //지연사유                                                                           
                        newIncident.work_time             = incident.work_time               //작업시간                                                                         
                        newIncident.complete_date         = incident.complete_date           //완료일                                                                                                                                                 
                        newIncident.complete_open_flag    = incident.complete_open_flag      //완료후공개여부                                                                                                                                        
                        newIncident.process_cd            = incident.process_cd              //처리구분
                        newIncident.process_nm            = incident.process_nm              //처리구분내용                                                                        
                        newIncident.valuation             = incident.valuation               //평가점수                                                                         
                        newIncident.valuation_content     = incident.valuation_content       //평가내용                                                                                                                                                                                                                 
                        newIncident.created_at            = incident.created_at              //생성일
                        
                        rtnVal.push(newIncident);
                });

                    //logger.debug("=====================");
                    //logger.debug("rtnVal : ", rtnVal);
                    //logger.debug("=====================");

                    res.json(rtnVal);
                }
            }).sort('-register_date');
        }catch(e){
            
        }finally{}
    },

    company: (req, res, next) => {

        CompanyModel.find({}, function (err, company) {
            
            if (err) {
                res.json(null);
            }else{

                //logger.debug("=====================");
                //logger.debug("company : ", company);
                //logger.debug("=====================");

                var rtnVal = [];

                company.forEach(function(company, index, companyArray){

                    var newCompany = {};
                    newCompany.company_cd             = company.company_cd               //회사코드
                    newCompany.company_nm             = company.company_nm               //회사이름   
                    
                    rtnVal.push(newCompany);
                });
                                                      

                //logger.debug("=====================");
                //logger.debug("rtnVal : ", rtnVal);
                //logger.debug("=====================");

                res.json(rtnVal);
            }
        }).sort({
            group_flag: -1,
            company_nm: 1
        });
    },
};