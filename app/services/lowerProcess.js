'use strict';

const logger = require('log4js').getLogger('app');

module.exports = {

    getMessage: () => {
        return 'Search Page';
    },

    createSearch: (req) => {

        var findLowerProcess = {},
            findUser = null,
            highlight = {};
        var AndQueries = []; 
        var OrQueries = [];

        if (req.query.searchText) {

            OrQueries.push({
                lower_nm: { $regex : new RegExp(req.query.searchText, "i") }
            });

            logger.debug('OrQueries : ' + OrQueries);
            
            highlight.content = req.query.searchText;

            if (OrQueries.length > 0){
                findLowerProcess.$or = OrQueries
            }
        }

        logger.debug('findLowerProcess : ' + JSON.stringify(findLowerProcess));
        logger.debug('req.query.searchText : ' + req.query.searchText);
        return {
            searchText: req.query.searchText,
            findLowerProcess: findLowerProcess,
            highlight: highlight
        };
    }

};