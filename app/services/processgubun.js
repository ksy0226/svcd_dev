'use strict';

const logger = require('log4js').getLogger('app');

module.exports = {

    getMessage: () => {
        return 'Search Page';
    },

    createSearch: (req) => {

        var findIncident = {},
            findUser = null,
            highlight = {};
        var AndQueries = []; 
        var OrQueries = [];

        if (req.query.searchText) {

            OrQueries.push({
                //process_nm:req.query.searchText
                process_nm: { $regex : new RegExp(req.query.searchText, "i") }
            });

            logger.debug('OrQueries : ' + OrQueries);
            
            highlight.content = req.query.searchText;

            if (OrQueries.length > 0){
                findIncident.$or = OrQueries
            }
        }

        logger.debug('findIncident : ' + JSON.stringify(findIncident));
        logger.debug('req.query.searchText : ' + req.query.searchText);
        return {
            //searchType: req.query.searchType,
            searchText: req.query.searchText,
            //higher_cd: req.query.higher_cd,
            //lower_cd: req.query.lower_cd,
            findIncident: findIncident,
            highlight: highlight
        };
    }

};