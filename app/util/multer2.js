'use strict';

const multer = require('multer');
const path = require('path');
const CONFIG = require('../../config/config.json');
const logger = require('log4js').getLogger('app');
const async = require('async');
const fs = require('fs');
require("date-utils");

var dt = new Date();
var storage = multer.diskStorage({
    destination : function (req, file, callback) {      
        async.waterfall([function () {
            var uploadDir = path.join(__dirname, "../../"+CONFIG.summernoteUpload.directory);
            uploadDir = path.join(uploadDir, dt.toFormat('YYYYMMDD'));
            fs.stat(uploadDir, function(err, stats){
                if(err){ //디렉토리가 존재하지 않으면
                    fs.mkdir(uploadDir);
                }
                callback(null, uploadDir);
            })
        }], function (err, uploadDir) {
            if (err) {
            }
            callback(null, uploadDir);
        });
    },
    filename : function (req, file, callback) {
        var fnm = file.originalname.split('.');   
        callback(null, 'ins_' + Date.now() + '.'+ fnm[fnm.length - 1] );
    }
});

var upload = multer({ storage: storage });
module.exports = upload;