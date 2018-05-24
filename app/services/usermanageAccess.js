'use strict';

const logger = require('log4js').getLogger('app');

module.exports = {

    createSearch: (req) => {

        var findUsermanage = {},
            highlight = {};
        var AndQueries = [];
        var OrQueries = [];
        var company_cd = req.query.company_cd == null ? "*" : req.query.company_cd;
        var access_yn = "";

        try {
            if (req.query.searchType && req.query.searchText) {
                var searchTypes = req.query.searchType.toLowerCase().split(",");
                if (searchTypes.indexOf("company_nm") >= 0) {
                    OrQueries.push({
                        company_nm: { $regex: new RegExp(req.query.searchText, "i") }
                    });
                    //console.log('OrQueries : ' + JSON.stringify(OrQueries));
                    highlight.company_nm = req.query.searchText;
                }
                if (searchTypes.indexOf("employee_nm") >= 0) {
                    OrQueries.push({
                        employee_nm: { $regex: new RegExp(req.query.searchText, "i") }
                    });
                    //console.log('OrQueries : ' + OrQueries);
                    highlight.employee_nm = req.query.searchText;
                }
                if (OrQueries.length > 0) {
                    findUsermanage.$or = OrQueries
                }
            }

            if (company_cd != '*') {
                AndQueries.push({
                    company_cd: req.query.company_cd
                });
            }

            if (access_yn != '*') {
                AndQueries.push({
                    access_yn: "N"
                });
            }

            //AndQuery 추가
            if (AndQueries.length > 0) {
                findUsermanage.$and = AndQueries
            }

            /*
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
            console.log('access_yn           ' + access_yn);
            console.log('searchType          ' + req.query.searchType);
            console.log('searchText          ' + req.query.searchText);
            console.log('company_cd          ' + req.query.company_cd);
            console.log('findUsermanage      ' + JSON.stringify(findUsermanage));
            console.log('highlight           ' + JSON.stringify(highlight));
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
            */
            
            return {
                access_yn: access_yn,
                searchType: req.query.searchType,
                searchText: req.query.searchText,
                company_cd: req.query.company_cd,
                findUsermanage: findUsermanage,
                highlight: highlight
            };
        } catch (e) {
            console.log("oftenqna service error : ", e);
        }
    }
};
