'use strict';

var async = require('async');
var logger = require('log4js').getLogger('app');


module.exports = {

    getMessage: () => {
        return 'Search Page';
    },

    createSearch: (req) => {

        //logger.debug("================incident service=================");
        //logger.debug("incident service req.query.gbn : ",req.query.gbn);
        //logger.debug("incident service req.query : ",req.query);
        //logger.debug("incident service req.session.user_flag : ",req.session.user_flag);
        //logger.debug("=================================================");

        var findIncident = {},
            findUser = null,
            highlight = {};
        var AndQueries = [];
        var OrQueries = [];

        if (req.query.searchType && req.query.searchText) {
            var searchTypes = req.query.searchType.toLowerCase().split(",");
            if (searchTypes.indexOf("title") >= 0) {
                OrQueries.push({
                    title: {
                        $regex: new RegExp(req.query.searchText, "i")
                    }
                });
                //logger.debug('OrQueries : ' + JSON.stringify(OrQueries));
                highlight.title = req.query.searchText;
            } else if (searchTypes.indexOf("content") >= 0) {
                OrQueries.push({
                    content: {
                        $regex: new RegExp(req.query.searchText, "i")
                    }
                });
                //logger.debug('OrQueries : ' + OrQueries);
                highlight.content = req.query.searchText;
            } else if (searchTypes.indexOf("request") >= 0) {
                OrQueries.push({
                    request_nm: {
                        $regex: new RegExp(req.query.searchText, "i")
                    }
                });
                highlight.request_nm = req.query.searchText;
            } else if (searchTypes.indexOf("manager") >= 0) {
                OrQueries.push({
                    manager_nm: {
                        $regex: new RegExp(req.query.searchText, "i")
                    }
                });
                highlight.manager_nm = req.query.searchText;
            } else if (searchTypes.indexOf("title,content") >= 0) {
                OrQueries.push({
                    title: {
                        $regex: new RegExp(req.query.searchText, "i")
                    },
                    content: {
                        $regex: new RegExp(req.query.searchText, "i")
                    }
                });
                //logger.debug('OrQueries : ' + OrQueries);
                highlight.content = req.query.searchText;
            }

            if (OrQueries.length > 0) {
                findIncident.$or = OrQueries
            }
        }

        var company_cd = req.query.company_cd == null ? "*" : req.query.company_cd;
        var higher_cd = req.query.higher_cd == null ? "*" : req.query.higher_cd;
        var lower_cd = req.query.lower_cd == null ? "*" : req.query.lower_cd;
        var status_cd = req.query.status_cd == null ? "*" : req.query.status_cd;
        var reg_date_from = req.query.reg_date_from;
        var reg_date_to = req.query.reg_date_to;

        /*2018-05-04, 검색기간 조회 로직 수정
            String의 경우, $gte, $lte 동작 안함
            1) from to 같을 경우, from 을 하루 전으로 조정함
            2) toISOString() 처리
        */  
        
        if(reg_date_from&&reg_date_to){
            if(reg_date_from == reg_date_to){  
                
                var df = new Date(reg_date_from);
                df.setDate(df.getDate()-1);  
                var df2 = df.toISOString();

                var dt = new Date(reg_date_to);
                var dt2 = dt.toISOString();


            }else{        

                var df = new Date(reg_date_from);
                df.setDate(df.getDate()-1);
                var df2 = df.toISOString(); 

                var dt = new Date(reg_date_to);
                //dt.setDate(dt.getDate()+1);
                var dt2 = dt.toISOString();
            } 
            
        }

        //진행상태가 존재하면
        if (status_cd != '*') {
            AndQueries.push({
                status_cd: req.query.status_cd
            });
        }

        //처리된 내용검색 gbn 구분 추가
        //gbn=complete 시, status=3,4만 가져오기
        if (req.query.gbn == "complete") {
            AndQueries.push({
                $or: [{
                    "status_cd": "3"
                }, {
                    "status_cd": "4"
                }]
            });
        }
        //추가 끝
        
        logger.debug("0 ================incident service=================");
        logger.debug("0 incident service user_flag == 1 ",company_cd);
        logger.debug("0 =================================================");

        logger.debug("00 ================incident service=================");
        logger.debug("00 req.query.user :  ",req.query.user);
        logger.debug("00 =================================================");

        

        //상위업무가 존재하면
        if (higher_cd != '*') {
            AndQueries.push({
                higher_cd: req.query.higher_cd
            });
        }

        //하위업무가 존재하면
        if (lower_cd != '*') {
            AndQueries.push({
                lower_cd: req.query.lower_cd
            });
        }

       //검색기간 조건 추가
        if (reg_date_from  && reg_date_to ) {
            AndQueries.push({
                register_date: {
                    $gte: df2,
                    $lte: dt2
                }
            });
        }
        

        //일반사용자
        if (req.session.user_flag == "9") {

            //logger.debug("================incident service=================");
            //logger.debug("incident service user_flag == 9");
            //logger.debug("=================================================");

            AndQueries.push({
                request_id: req.session.email
            });

        //고객사관리자(user_flag = 5)이면
        } else if (req.session.user_flag == "5") {

            //logger.debug("================incident service=================");
            //logger.debug("incident service user_flag == 5");
            //logger.debug("=================================================");

            AndQueries.push({
                request_company_cd: req.session.company_cd
            });

        //업무담당자 (user_flag = 4)이면
        } else if (req.session.user_flag == "4") {

            //logger.debug("================incident service=================");
            //logger.debug("incident service user_flag == 4");
            //logger.debug("=================================================");
            //회사코드가 존재하면
            if(req.query.user == "managerall"){
                if (company_cd != '*') {
                    AndQueries.push({
                        request_company_cd: company_cd
                    });
                }
            }else if(req.query.user == "manager"){
                if (company_cd != '*') {
                    AndQueries.push({
                        request_company_cd: company_cd
                    });
                }
            }

        //업무관리자 (user_flag = 3)이면
        } else if (req.session.user_flag == "3") {

            //logger.debug("================incident service=================");
            //logger.debug("incident service user_flag == 3 req.query.user : ",req.query.user);
            //logger.debug("=================================================");

            //if(req.query.user != "manager"){
                if(req.query.user == "managerall"){
                    if (company_cd != '*') {
                        AndQueries.push({
                            request_company_cd: company_cd
                        });
                    }
                } else if(req.query.user == "manager"){
                    if (company_cd != '*') {
                        AndQueries.push({
                            request_company_cd: company_cd
                        });
                    }
                } else {
                    AndQueries.push({
                        manager_dept_cd: req.session.dept_cd
                        //manager_dept_cd: "ISU_STISU_ST005"
                    });
                }
            //}

        }else if(req.session.user_flag == "1") {

            if(req.query.user == "managerall" ){
                //logger.debug("================incident service=================");
                //logger.debug("req.query.user",req.query.user);
                //logger.debug("=================================================");

                if (company_cd != '*') {
                    AndQueries.push({
                        request_company_cd: company_cd
                    });
                }
            } else if(req.query.user == "manager"){
                //logger.debug("================incident service=================");
                //logger.debug("req.query.user = manager : ",req.query.user);
                //logger.debug("=================================================");

                if (company_cd != '*' && company_cd != 'null' ) {
                    AndQueries.push({
                        request_company_cd: company_cd
                    });
                }
            }
            

        }


        if (AndQueries.length > 0) {
            findIncident.$and = AndQueries
        }

        logger.debug('121212 findIncident : ' + JSON.stringify(findIncident));
        
        //logger.debug('req.query.higher_cd : ' + req.query.higher_cd);
        //logger.debug('req.query.lower_cd : ' + req.query.lower_cd);
        //logger.debug('req.query.searchType : ' + req.query.searchType);
        //logger.debug('req.query.searchText : ' + req.query.searchText);
        logger.debug('req.query.reg_date_from : ' + req.query.reg_date_from);
        logger.debug('req.query.reg_date_to : ' + req.query.reg_date_to);
        
        //Date date = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.S").parse(reg_date_from);
        //reg_date_from = reg_date_from.toISODate();
         
          
        //console.log('findIncident : ' + JSON.stringify(findIncident));

        return {
            searchType: req.query.searchType,
            searchText: req.query.searchText,
            higher_cd: req.query.higher_cd,
            lower_cd: req.query.lower_cd,
            findIncident: findIncident,
            highlight: highlight
        };
    }
};