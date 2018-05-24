'use strict';

const logger = require('log4js').getLogger('app');

module.exports = {

    getMessage: () => {
        return 'Search Page';
    },

    createSearch: (req) => {

        var findHigherProcess = {},
            highlight = {};
        var AndQueries = []; 
        var OrQueries = [];

        if (req.query.searchText) {

            OrQueries.push({
                higher_nm: { $regex : new RegExp(req.query.searchText, "i") }
            });

            logger.debug('OrQueries : ' + OrQueries);
            
            highlight.content = req.query.searchText;

            if (OrQueries.length > 0){
                findHigherProcess.$or = OrQueries
            }
        }

        logger.debug('findHigherProcess : ' + JSON.stringify(findHigherProcess));
        logger.debug('req.query.searchText : ' + req.query.searchText);

        return {
            searchText: req.query.searchText,
            findHigherProcess: findHigherProcess,
            highlight: highlight
        };
    }

};