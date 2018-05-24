//Cookie 사용
var express = require('express');
var cookieParser = require('cookie-parser');
//var Employee = require('../../app/models/Employee');
var Usermanage = require('../../app/models/Usermanage');
var app = express();
var router = express.Router();
const path = require('path');
require('../../config/mongoose');

//res.cookie(username, 'value', {expire : new Date() + 9999});
