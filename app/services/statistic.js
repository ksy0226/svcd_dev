'use strict';

const logger = require('log4js').getLogger('app');

module.exports = {

    /**
     * 상위업무별 하위업무 통계 옵션 및 그룹
    */
    high_lower: (req) => {

        var condition = {};
        var OrQueries = [];

        if (req.query.company_cd != null && req.query.company_cd != '*') {
            condition.request_company_cd = req.query.company_cd;
        }
        if (req.query.yyyy != null) {
            condition.register_yyyy = req.query.yyyy;
        }
        if (req.query.mm != null && req.query.mm != '*') {
            condition.register_mm = req.query.mm;
        }
        //[접수대기] 건 제외
        OrQueries.push({
            $or: [{
                status_cd: "2"
            }, {
                status_cd: "3"
            }, {
                status_cd: "4"
            }]
        });

        condition.$or = OrQueries;
        
        logger.debug("==========================================statistic service=========================================");
        logger.debug("condifion : ", condition);
        logger.debug("====================================================================================================");

        var aggregatorOpts = [
            {
                $match: condition
            },
            {
                $group: { //업무별 상태별 집계
                    _id: {
                        higher_cd: "$higher_cd",
                        higher_nm: "$higher_nm",
                        lower_cd: "$lower_cd",
                        lower_nm: "$lower_nm",
                        status_cd: "$status_cd",
                        status_nm: "$status_nm"
                    },
                    count: {
                        $sum: 1
                    },
                    valuationSum: {
                        $sum: "$valuation"
                    }
                }
            }
            , {
                $group: { //상태별 집계
                    _id: {
                        higher_cd: "$_id.higher_cd",
                        higher_nm: "$_id.higher_nm",
                        lower_cd: "$_id.lower_cd",
                        lower_nm: "$_id.lower_nm"
                    },
                    grp: {
                        $push: {
                            status_cd: "$_id.status_cd",
                            count: "$count"
                        }
                    },
                    valuationSum: {
                        $sum: "$valuationSum"
                    }
                }
            }
            
            ,{ "$sort": { "_id.higher_cd" : 1, "_id.lower_cd" : 1 } }

        ]

        logger.debug("==================================================");
        logger.debug('high_lower ', JSON.stringify(aggregatorOpts));
        logger.debug("==================================================");

        return {
            aggregatorOpts: aggregatorOpts
        };
    },

    /**
     * 회사별 상위업무 통계 옵션 및 그룹
    */
    com_higher:(req) => {
        
        var condition = {};
        var OrQueries = [];
        
        if (req.query.company_cd != null && req.query.company_cd != '*') {
            condition.request_company_cd = req.query.company_cd;
        }

        if (req.query.higher_cd != null && req.query.higher_cd != '*') {
            condition.higher_cd = req.query.higher_cd;
        }

        if (req.query.yyyy != null) {
            condition.register_yyyy = req.query.yyyy;
        }

        //[접수대기] 건 제외
        OrQueries.push({
            $or: [{
                status_cd: "2"
            }, {
                status_cd: "3"
            }, {
                status_cd: "4"
            }]
        });

        condition.$or = OrQueries;
        
        logger.debug("==========================================statistic service=========================================");
        logger.debug("condifion : ", condition);
        logger.debug("====================================================================================================");

        var aggregatorOpts = [
            {
                $match: condition
            },
            {
                $group: { //업무별 상태별 집계
                    _id: {
                        request_company_cd: "$request_company_cd",
                        request_company_nm: "$request_company_nm",
                        higher_cd: "$higher_cd",
                        higher_nm: "$higher_nm",
                        status_cd: "$status_cd",
                        status_nm: "$status_nm"
                    },
                    count: {
                        $sum: 1
                    },
                    valuationSum: {
                        $sum: "$valuation"
                    }
                }
            }
            , {
                $group: { //상태별 집계
                    _id: {
                        request_company_cd: "$_id.request_company_cd",
                        request_company_nm: "$_id.request_company_nm",
                        higher_cd: "$_id.higher_cd",
                        higher_nm: "$_id.higher_nm"
                    },
                    grp: {
                        $push: {
                            status_cd: "$_id.status_cd",
                            count: "$count"
                        }
                    },
                    valuationSum: {
                        $sum: "$valuationSum"
                    }
                }
            }
            
            ,{ "$sort": { "_id.request_company_cd" : -1, "_id.higher_cd" : 1 } }

        ]

        logger.debug("==================================================");
        logger.debug('com_higher :  ', JSON.stringify(aggregatorOpts));
        logger.debug("==================================================");

        return {
            aggregatorOpts: aggregatorOpts
        };
    },

    /**
     * 처리구분별 통계 옵션 및 그룹
    */
    process_gubun: (req) => {

        var condition = {};
        var OrQueries = [];
        
        if (req.query.company_cd != null && req.query.company_cd != '*') {
            condition.request_company_cd = req.query.company_cd;
        }

        if (req.query.higher_cd != null && req.query.higher_cd != '*') {
            condition.higher_cd = req.query.higher_cd;
        }
        if (req.query.yyyy != null) {
            condition.register_yyyy = req.query.yyyy;
        }

        
        //[접수대기] 건 제외
        OrQueries.push({
            $or: [{
                status_cd: "3"
            }, {
                status_cd: "4"
            }]
        });

        condition.$or = OrQueries;
        
        logger.debug("==========================================statistic service=========================================");
        logger.debug("condifion : ", condition);
        logger.debug("====================================================================================================");

        var aggregatorOpts = [
            {
                $match: condition
            },
            {
                $group: { //프로세스 구분, 상태별 집계
                    _id: {
                        //request_company_cd: "$request_company_cd",
                        //request_company_nm: "$request_company_nm",
                        //higher_cd: "$higher_cd",
                        //higher_nm: "$higher_nm",
                        status_cd: "$status_cd",
                        status_nm: "$status_nm",
                        process_cd:"$process_cd",
                        process_nm:"$process_nm"
                    },
                    count: {
                        $sum: 1
                    },
                    valuationSum: {
                        $sum: "$valuation"
                    }
                }
            }
            , {
                $group: { //상태별 집계
                    _id: {
                        //request_company_cd: "$_id.request_company_cd",
                        //request_company_nm: "$_id.request_company_nm",
                        //higher_cd: "$_id.higher_cd",
                        //higher_nm: "$_id.higher_nm",
                        process_cd: "$_id.process_cd",
                        process_nm: "$_id.process_nm"
                    },
                    grp: {
                        $push: {
                            status_cd: "$_id.status_cd",
                            count: "$count"
                        }
                    },
                    valuationSum: {
                        $sum: "$valuationSum"
                    }
                }
            }
            
            ,{ "$sort": { "_id.request_company_cd" : -1, "_id.process_nm" : 1} }

        ]

        logger.debug("==================================================");
        logger.debug('process_gubun :  ', JSON.stringify(aggregatorOpts));
        logger.debug("==================================================");

        return {
            aggregatorOpts: aggregatorOpts
        };
    },
        
        

    /**
     * 담당자별 월별 통계 옵션 및 그룹
     */
    mng_month: (req) => {
        
        logger.debug("==========================================statistic service=========================================");
        logger.debug("mng_month >>>>>>>: ");
        logger.debug("====================================================================================================");
        
        var condition = {};
        var OrQueries = [];
        
        
        if (req.query.higher_cd != null && req.query.higher_cd != '*') {
            condition.higher_cd = req.query.higher_cd;
        }
        
        if (req.query.yyyy != null) {
            condition.register_yyyy = req.query.yyyy;
        }
        if (req.query.mm != null && req.query.mm != '*') {
            condition.register_mm = req.query.mm;
        }

        OrQueries.push({
            $or: [{
                status_cd: "2"
            }, {
                status_cd: "3"
            }, {
                status_cd: "4"
            }]
        });

        condition.$or = OrQueries;
        
        logger.debug("==========================================statistic service=========================================");
        logger.debug("condifion : ", condition);
        logger.debug("====================================================================================================");

        var aggregatorOpts = [
            {
                $match: condition
            },
            {
                $group: { //업무별 상태별 집계
                    _id: {
                        register_mm: "$register_mm",
                        higher_cd: "$higher_cd",
                        higher_nm: "$higher_nm",
                        lower_cd: "$lower_cd",
                        lower_nm: "$lower_nm",
                        status_cd: "$status_cd",
                        status_nm: "$status_nm"
                    },
                    count: {
                        $sum: 1
                    },
                    valuationSum: {
                        $sum: "$valuation"
                    }
                }
            }
            , {
                $group: { //상태별 집계
                    _id: {
                        register_mm: "$_id.register_mm",
                        higher_cd: "$_id.higher_cd",
                        higher_nm: "$_id.higher_nm",
                        lower_cd: "$_id.lower_cd",
                        lower_nm: "$_id.lower_nm"
                    },
                    grp: {
                        $push: {
                            status_cd: "$_id.status_cd",
                            count: "$count"
                        }
                    },
                    valuationSum: {
                        $sum: "$valuationSum"
                    }
                }
            }
            
            ,{ "$sort": { "_id.register_mm" : 1, "_id.higher_cd" : 1, "_id.lower_cd" : 1 } }

        ]

        logger.debug("==================================================");
        logger.debug('mng_month aggregatorOpts>> ', JSON.stringify(aggregatorOpts));
        logger.debug("==================================================");

        return {
            aggregatorOpts: aggregatorOpts
        };
    }
};